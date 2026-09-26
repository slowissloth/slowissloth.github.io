const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function seoulDateParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  return Object.fromEntries(
    formatter.formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
  );
}

export function suggestedSlug(title, now = new Date()) {
  const ascii = title
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-$/g, '');
  if (ascii) return ascii;
  const { year, month, day, hour, minute, second } = seoulDateParts(now);
  return `music-review-${year}${month}${day}-${hour}${minute}${second}`;
}

export function createReview({ title, tags, slug, body }, now = new Date()) {
  const cleanTitle = title.trim();
  const cleanBody = body.replace(/\r\n?/g, '\n').trim();
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanTitle) throw new Error('글 제목을 입력해 주세요.');
  if (!cleanBody) throw new Error('본문을 입력해 주세요.');
  if (!SLUG_PATTERN.test(cleanSlug) || cleanSlug.length > 90) {
    throw new Error('글 주소에는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.');
  }

  const cleanTags = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  const { year, month, day, hour, minute, second } = seoulDateParts(now);
  const date = `${year}-${month}-${day}`;
  const filename = `${date}-${cleanSlug}.md`;
  const source = [
    '---',
    `title: ${JSON.stringify(cleanTitle)}`,
    `date: ${date} ${hour}:${minute}:${second} +0900`,
    'categories: [음악평론]',
    `tags: ${JSON.stringify(cleanTags)}`,
    '---',
    '',
    cleanBody,
    ''
  ].join('\n');
  return { filename, slug: cleanSlug, source };
}

export function utf8Base64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return btoa(binary);
}

export async function publishReviewToGitHub({ owner, repo, branch, review, token, fetchImpl = fetch }) {
  const path = `_posts/${review.filename}`;
  const response = await fetchImpl(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2026-03-10'
    },
    body: JSON.stringify({
      message: `feat(post): add music review ${review.slug}`,
      content: utf8Base64(review.source),
      branch
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) throw new Error('토큰을 확인해 주세요. 인증에 실패했습니다.');
    if (response.status === 403) throw new Error('저장소의 Contents 쓰기 권한이나 브랜치 설정을 확인해 주세요.');
    if (response.status === 404) throw new Error('저장소에 접근할 수 없습니다. 토큰의 대상 저장소를 확인해 주세요.');
    if (response.status === 422) throw new Error('같은 주소의 글이 이미 있거나 입력값이 올바르지 않습니다. 글 주소를 바꿔 주세요.');
    throw new Error(`GitHub 발행에 실패했습니다. 상태 코드: ${response.status}.`);
  }
  if (!result.commit?.sha) throw new Error('GitHub의 발행 결과를 확인할 수 없습니다. 저장소에서 커밋을 확인해 주세요.');
  return result.commit.sha;
}
