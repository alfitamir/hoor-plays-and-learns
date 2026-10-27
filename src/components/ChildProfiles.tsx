import React, { useState } from 'react';
import { Plus, UserRound, Users, X } from 'lucide-react';
import type { GameSettings, PlayerProgress } from '../types/game';

export interface LocalChildProfile {
  id: string;
  name: string;
  settings: GameSettings;
  progress: PlayerProgress;
  ageSelected: boolean;
}

interface ChildProfilesProps {
  profiles: LocalChildProfile[];
  activeProfileId: string;
  onSelect: (profileId: string) => void;
  onAdd: (name: string) => void;
  onDelete: (profileId: string) => void;
}

export const ChildProfiles: React.FC<ChildProfilesProps> = ({
  profiles,
  activeProfileId,
  onSelect,
  onAdd,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LocalChildProfile | null>(null);
  const [challenge, setChallenge] = useState<{ first: number; second: number } | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const startDelete = (profile: LocalChildProfile) => {
    setDeleteTarget(profile);
    setChallenge({ first: 20 + Math.floor(Math.random() * 30), second: 20 + Math.floor(Math.random() * 30) });
    setAnswer('');
    setError(false);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setChallenge(null);
    setAnswer('');
    setError(false);
  };

  const confirmDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge || !deleteTarget) return;
    if (answer.trim() === '' || !Number.isInteger(Number(answer)) || Number(answer) !== challenge.first + challenge.second) {
      setAnswer('');
      setError(true);
      return;
    }
    onDelete(deleteTarget.id);
    cancelDelete();
  };

  const submitNewProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, ' ');
    if (!cleanName || cleanName.length > 32) return;
    onAdd(cleanName);
    setName('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] text-right" dir="rtl">
      {isOpen ? (
        <section className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-violet-200 bg-white p-4 shadow-xl" aria-label="ملفات الأطفال المحلية">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-black text-slate-900">ملفات الأطفال</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">كل ملف يحفظ الإعدادات والتقدم على هذا الجهاز فقط.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="إغلاق ملفات الأطفال">
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {profiles.map((profile) => (
              <li key={profile.id} className={`flex items-center gap-2 rounded-xl border p-2 ${profile.id === activeProfileId ? 'border-violet-400 bg-violet-50' : 'border-slate-200'}`}>
                <button type="button" onClick={() => onSelect(profile.id)} aria-current={profile.id === activeProfileId ? 'true' : undefined} className="flex min-h-10 flex-1 items-center gap-2 text-right text-sm font-extrabold text-slate-800">
                  <UserRound className="h-4 w-4 shrink-0 text-violet-600" />
                  <span className="truncate">{profile.name}</span>
                  {profile.id === activeProfileId && <span className="text-[10px] text-violet-700">الحالي</span>}
                </button>
                {profiles.length > 1 && (
                  <button type="button" onClick={() => startDelete(profile)} aria-label={`حذف ملف ${profile.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <form onSubmit={submitNewProfile} className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={32} placeholder="اسم الطفل" aria-label="اسم الملف الجديد" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <button type="submit" disabled={!name.trim()} className="flex min-h-10 items-center gap-1 rounded-xl bg-violet-600 px-3 text-xs font-extrabold text-white hover:bg-violet-700 disabled:opacity-50">
              <Plus className="h-4 w-4" /> إضافة
            </button>
          </form>
          <p className="mt-2 text-[11px] font-bold text-slate-500">الملفات غير متزامنة بين الأجهزة. استخدمي النسخ الاحتياطي لنقل ملف واحد.</p>
        </section>
      ) : (
        <button type="button" onClick={() => setIsOpen(true)} className="flex min-h-11 items-center gap-2 rounded-full border border-violet-300 bg-white px-4 text-xs font-extrabold text-violet-900 shadow-lg hover:bg-violet-50" aria-label="إدارة ملفات الأطفال">
          <Users className="h-4 w-4" /> ملفات الأطفال
        </button>
      )}

      {challenge && deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4" role="presentation">
          <form onSubmit={confirmDelete} role="dialog" aria-modal="true" aria-labelledby="profile-delete-title" className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 text-right shadow-2xl">
            <div>
              <h3 id="profile-delete-title" className="font-black text-slate-900">تأكيد حذف ملف الطفل</h3>
              <p className="mt-2 text-sm font-bold text-slate-600">لحماية البيانات، اطلبي من ولي الأمر حل المسألة التالية:</p>
              <p className="mt-2 text-center text-2xl font-black text-violet-800" aria-label="مسألة جمع">{challenge.first} + {challenge.second} = ؟</p>
            </div>
            <input type="number" inputMode="numeric" autoFocus value={answer} onChange={(event) => { setAnswer(event.target.value); setError(false); }} aria-label="ناتج الجمع" aria-invalid={error} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-left" />
            {error && <p role="alert" className="text-sm font-bold text-rose-700">الإجابة غير صحيحة؛ حاولي مجدداً.</p>}
            <div className="flex gap-2">
              <button type="submit" className="min-h-11 flex-1 rounded-xl bg-rose-600 px-3 text-sm font-extrabold text-white">تأكيد الحذف</button>
              <button type="button" onClick={cancelDelete} className="min-h-11 flex-1 rounded-xl bg-slate-100 px-3 text-sm font-extrabold text-slate-700">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
