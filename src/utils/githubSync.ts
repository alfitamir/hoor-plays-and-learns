export interface GitHubSyncFile {
  path: string;
  encoding: 'utf-8' | 'base64';
  size: number;
  content: string;
}

export interface GitHubSyncManifest {
  generatedAt: string;
  version: string;
  totalFiles: number;
  files: GitHubSyncFile[];
}

export interface GitHubSyncProgress {
  step: string;
  percent: number;
}

export interface GitHubSyncResult {
  success: boolean;
  repoUrl?: string;
  owner?: string;
  repo?: string;
  filesCount?: number;
  commitSha?: string;
  error?: string;
}

export async function syncRepositoryToGitHub(
  token: string,
  repoNameInput: string,
  isPrivate: boolean,
  onProgress: (progress: GitHubSyncProgress) => void
): Promise<GitHubSyncResult> {
  const cleanToken = token.trim();
  const cleanRepo = repoNameInput
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '') || 'hoor-plays-and-learns';

  if (!cleanToken) {
    return {
      success: false,
      error: 'يرجى إدخال رمز الوصول الشخصي (GitHub Personal Access Token)',
    };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    // 1. Verify authenticated user
    onProgress({ step: 'جاري التحقق من حساب GitHub...', percent: 10 });
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) {
      throw new Error(
        'تعذر التحقق من رمز GitHub Token. تأكد من صلاحية الرمز وتفعيل صلاحية repo أو Contents (Read & Write).'
      );
    }
    const userData = await userRes.json();
    const owner: string = userData.login;

    // 2. Check if repository exists or create it
    onProgress({ step: `جاري تجهيز المستودع ${owner}/${cleanRepo}...`, percent: 22 });
    let repoRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers,
    });

    if (repoRes.status === 404) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: cleanRepo,
          description:
            'حور تلعب و تتعلم (Hoor Plays & Learns) - لعبة تعليمية تفاعلية باللغة العربية مع آيات قرآنية وتطبيق أندرويد APK أوفلاين',
          private: isPrivate,
          auto_init: true,
        }),
      });
      if (!createRes.ok) {
        const errBody = await createRes.json().catch(() => ({}));
        throw new Error(
          errBody.message || 'تعذر إنشاء المستودع على GitHub. تأكد من صلاحيات الرمز (repo).'
        );
      }
      repoRes = createRes;
      // Wait briefly for GitHub to initialize default branch
      await new Promise((r) => setTimeout(r, 1200));
    }

    const repoData = await repoRes.json();
    const defaultBranch: string = repoData.default_branch || 'main';

    // 3. Load repository manifest
    onProgress({ step: 'جاري قراءة ملفات الكود المصدري وحزمة APK...', percent: 35 });
    const manifestRes = await fetch(`/github-sync-manifest.json?t=${Date.now()}`);
    if (!manifestRes.ok) {
      throw new Error('تعذر تحميل حزمة ملفات المزامنة المحلية');
    }
    const manifest: GitHubSyncManifest = await manifestRes.json();

    // Check if repository has at least one commit (if empty, initialize README via Contents API first)
    let refRes = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/git/ref/heads/${defaultBranch}`,
      { headers }
    );

    if (refRes.status === 404 || refRes.status === 409) {
      onProgress({ step: 'جاري تهيئة الفرع الرئيسي في المستودع الجديد...', percent: 42 });
      await fetch(
        `https://api.github.com/repos/${owner}/${cleanRepo}/contents/README.md`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: 'Initial commit: Hoor Plays & Learns',
            content: btoa(unescape(encodeURIComponent('# حور تلعب و تتعلم\n'))),
            branch: defaultBranch,
          }),
        }
      );
      await new Promise((r) => setTimeout(r, 1000));
      refRes = await fetch(
        `https://api.github.com/repos/${owner}/${cleanRepo}/git/ref/heads/${defaultBranch}`,
        { headers }
      );
    }

    if (!refRes.ok) {
      throw new Error('تعذر قراءة الفرع الرئيسي للمستودع على GitHub');
    }

    const refData = await refRes.json();
    const latestCommitSha: string = refData.object.sha;

    // 4. Create Git Blobs for all files
    const treeItems: Array<{
      path: string;
      mode: '100644' | '100755';
      type: 'blob';
      sha: string;
    }> = [];

    for (let i = 0; i < manifest.files.length; i++) {
      const file = manifest.files[i];
      const pct = 45 + Math.round(((i + 1) / manifest.files.length) * 40);
      onProgress({
        step: `جاري رفع الملف (${i + 1}/${manifest.files.length}): ${file.path}`,
        percent: pct,
      });

      const blobRes = await fetch(
        `https://api.github.com/repos/${owner}/${cleanRepo}/git/blobs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: file.content,
            encoding: file.encoding,
          }),
        }
      );

      if (!blobRes.ok) {
        const errData = await blobRes.json().catch(() => ({}));
        throw new Error(`فشل رفع الملف ${file.path}: ${errData.message || blobRes.statusText}`);
      }

      const blobData = await blobRes.json();
      treeItems.push({
        path: file.path,
        mode: file.path.endsWith('.sh') ? '100755' : '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // 5. Create Git Tree
    onProgress({ step: 'جاري بناء شجرة الملفات (Git Tree)...', percent: 88 });
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          base_tree: latestCommitSha,
          tree: treeItems,
        }),
      }
    );

    if (!treeRes.ok) {
      throw new Error('تعذر إنشاء شجرة الملفات على GitHub');
    }
    const treeData = await treeRes.json();

    // 6. Create Git Commit
    onProgress({ step: 'جاري اعتماد التعديلات (Git Commit)...', percent: 94 });
    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/git/commits`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: `Sync full codebase & signed Android APK (v${manifest.version}) - حور تلعب و تتعلم`,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      }
    );

    if (!commitRes.ok) {
      throw new Error('تعذر تسجيل الـ Commit على GitHub');
    }
    const commitData = await commitRes.json();

    // 7. Update Branch Reference
    onProgress({ step: 'جاري تحديث الفرع الرئيسي (git push)...', percent: 98 });
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/git/refs/heads/${defaultBranch}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: commitData.sha,
          force: true,
        }),
      }
    );

    if (!updateRefRes.ok) {
      throw new Error('تعذر تحديث الفرع الرئيسي في المستودع');
    }

    onProgress({ step: 'تمت المزامنة الكاملة بنجاح ١٠٠٪!', percent: 100 });
    return {
      success: true,
      repoUrl: `https://github.com/${owner}/${cleanRepo}`,
      owner,
      repo: cleanRepo,
      filesCount: manifest.files.length,
      commitSha: commitData.sha.slice(0, 7),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء المزامنة مع GitHub',
    };
  }
}
