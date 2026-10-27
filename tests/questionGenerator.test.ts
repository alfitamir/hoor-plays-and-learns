import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateQuestion } from '../src/utils/questionGenerator';
import type { AgeGroupId, DifficultyLevel, SubjectFilter } from '../src/types/game';

function withFixedRandom<T>(value: number, callback: () => T): T {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function ask(
  subject: SubjectFilter,
  ageGroup: AgeGroupId,
  difficulty: DifficultyLevel = 'easy'
) {
  return withFixedRandom(0, () => generateQuestion(difficulty, subject, ageGroup));
}

function assertOptionsIncludeCorrectAnswer(question: ReturnType<typeof ask>, count: number) {
  assert.equal(question.options.length, count);
  const values = question.options.map((option) => option.value);
  assert.equal(new Set(values).size, values.length, 'options should be unique');
  assert.ok(values.includes(question.correctValue), 'the correct answer must be an option');
}

test('multiplication is directly supported with age-appropriate ranges', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const question = ask('multiplication', '6_to_9', difficulty);
    assert.equal(question.type, 'multiplication');
    assert.equal(question.ageGroup, '6_to_9');
    assert.match(question.equationDisplay ?? '', /^(\d+) × (\d+) = ؟$/);
    const [, a, b] = question.equationDisplay!.match(/^(\d+) × (\d+) = ؟$/)!;
    assert.equal(question.correctValue, Number(a) * Number(b));
    const factorRange = difficulty === 'easy' ? [2, 5] : difficulty === 'medium' ? [2, 9] : [3, 12];
    assert.ok(Number(a) >= factorRange[0] && Number(a) <= factorRange[1]);
    assert.ok(Number(b) >= factorRange[0] && Number(b) <= factorRange[1]);
    assertOptionsIncludeCorrectAnswer(question, 4);
    assert.ok(
      question.options.every(
        (option) =>
          typeof option.value === 'number' &&
          option.value >= 1 &&
          option.value <= Number(question.correctValue) + 29
      )
    );
  }

  const olderQuestion = ask('multiplication', '10_plus', 'easy');
  assert.equal(olderQuestion.type, 'multiplication');
  assert.equal(olderQuestion.ageGroup, '10_plus');
  const [, a, b] = olderQuestion.equationDisplay!.match(/^(\d+) × (\d+) = ؟$/)!;
  assert.equal(olderQuestion.correctValue, Number(a) * Number(b));
  assertOptionsIncludeCorrectAnswer(olderQuestion, 4);
});

test('advanced math stays advanced for 10+ and is explicitly simplified for ages 6–9', () => {
  const olderQuestion = ask('advanced_math', '10_plus');
  assert.ok(['multiplication', 'division', 'powers', 'equation'].includes(olderQuestion.type));
  assert.equal(olderQuestion.ageGroup, '10_plus');
  assertOptionsIncludeCorrectAnswer(olderQuestion, 4);

  const youngerQuestion = ask('advanced_math', '6_to_9');
  assert.equal(youngerQuestion.type, 'multiplication');
  assert.match(youngerQuestion.titleAr, /مستوى مبسط/);
  assert.match(youngerQuestion.hintAr, /بُسّط اختيار الرياضيات المتقدمة/);
  assertOptionsIncludeCorrectAnswer(youngerQuestion, 4);
});

test('general knowledge is honored for ages 6–9 and 10+', () => {
  for (const ageGroup of ['6_to_9', '10_plus'] as const) {
    const question = ask('general_knowledge', ageGroup);
    assert.equal(question.type, 'general_knowledge');
    assert.equal(question.ageGroup, ageGroup);
    assertOptionsIncludeCorrectAnswer(question, 4);
    assert.ok(question.options.every((option) => typeof option.value === 'string'));
  }
});

test('addition and subtraction selections work for ages 10+ and remain safe for under-five users', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    for (const subject of ['addition', 'subtraction'] as const) {
      const question = ask(subject, '10_plus', difficulty);
      assert.equal(question.type, subject);
      assert.equal(question.ageGroup, '10_plus');
      assertOptionsIncludeCorrectAnswer(question, 4);
      const match = question.equationDisplay!.match(/^(\d+) ([+-]) (\d+) = ؟$/)!;
      const [, first, operator, second] = match;
      const expected = operator === '+' ? Number(first) + Number(second) : Number(first) - Number(second);
      assert.equal(question.correctValue, expected);
      assert.ok(Number(question.correctValue) >= 0);
    }
  }

  const mathQuestion = ask('math', '10_plus');
  assert.ok(['addition', 'subtraction'].includes(mathQuestion.type));
  assert.equal(mathQuestion.ageGroup, '10_plus');
  assertOptionsIncludeCorrectAnswer(mathQuestion, 4);

  const toddlerQuestion = ask('subtraction', 'under_5');
  assert.equal(toddlerQuestion.type, 'counting');
  assert.match(toddlerQuestion.titleAr, /اختيارك: الطرح/);
  assert.match(toddlerQuestion.hintAr, /حُوّل الاختيار بوضوح/);
  assertOptionsIncludeCorrectAnswer(toddlerQuestion, 3);
});

test('under-five fallbacks for the requested subjects are age-appropriate and announced', () => {
  const cases = [
    { subject: 'multiplication', type: 'addition', notice: 'الضرب' },
    { subject: 'advanced_math', type: 'addition', notice: 'الرياضيات المتقدمة' },
    { subject: 'general_knowledge', type: 'shapes', notice: 'المعلومات العامة' },
  ] as const;

  for (const { subject, type, notice } of cases) {
    const question = ask(subject, 'under_5');
    assert.equal(question.type, type);
    assert.equal(question.ageGroup, 'under_5');
    assert.ok(question.titleAr.includes(notice), `title should disclose requested subject: ${subject}`);
    assert.match(question.hintAr, /غير مناسب|غير مناسبين/);
    assertOptionsIncludeCorrectAnswer(question, type === 'addition' ? 2 : 3);

    if (type === 'addition') {
      const [, a, b] = question.equationDisplay!.match(/^(\d+) \+ (\d+) = ؟$/)!;
      assert.equal(question.correctValue, Number(a) + Number(b));
      assert.ok(
        question.options.every(
          (option) => typeof option.value === 'number' && option.value >= 1 && option.value <= 9
        )
      );
    }
  }
});

test('existing explicit age-group subjects retain their current question types', () => {
  assert.ok(['addition', 'counting'].includes(ask('addition', 'under_5').type));
  assert.equal(ask('english', 'under_5').type, 'english');
  assert.equal(ask('addition', '6_to_9').type, 'addition');
  assert.equal(ask('subtraction', '6_to_9').type, 'subtraction');
  assert.equal(ask('english', '6_to_9').type, 'english');
  assert.equal(ask('english', '10_plus').type, 'english');
  assert.equal(ask('general_knowledge', '10_plus').type, 'general_knowledge');
});
