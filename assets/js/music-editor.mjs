import { createReview, suggestedSlug, seoulDateParts, publishReviewToGitHub } from './music-editor-core.mjs';

const form = document.querySelector('#review-form');
const titleInput = document.querySelector('#review-title');
const tagsInput = document.querySelector('#review-tags');
const slugInput = document.querySelector('#review-slug');
const bodyInput = document.querySelector('#review-body');
const tokenInput = document.querySelector('#github-token');
const fileName = document.querySelector('#file-name');
const status = document.querySelector('#status');
const links = document.querySelector('#published-links');
const publishButton = document.querySelector('#publish-button');
const downloadButton = document.querySelector('#download-button');
const clearButton = document.querySelector('#clear-button');
const details = document.querySelector('.publish-details');
const saveState = document.querySelector('#save-state');
const draftKey = 'slowissloth-music-review-draft-v1';
const { owner, repo, branch } = form.dataset;
const isPublishedSite = location.protocol === 'https:' && location.hostname === `${owner}.github.io`;

let slugEdited = false;
let alreadyPublished = false;

function setStatus(message, kind = '') {
  status.textContent = message;
  status.className = `status ${kind}`.trim();
}

function readFields() {
  return {
    title: titleInput.value,
    tags: tagsInput.value,
    slug: slugInput.value,
    body: bodyInput.value
  };
}

function saveDraft() {
  try {
    localStorage.setItem(draftKey, JSON.stringify(readFields()));
    saveState.textContent = '방금 이 브라우저에 저장했습니다.';
  } catch {
    saveState.textContent = '자동 저장을 사용할 수 없습니다.';
    setStatus('브라우저 저장 공간을 사용할 수 없습니다. 마크다운 파일을 내려받아 보관해 주세요.', 'error');
  }
}

function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
    if (!draft || typeof draft !== 'object') return;
    titleInput.value = typeof draft.title === 'string' ? draft.title : '';
    tagsInput.value = typeof draft.tags === 'string' ? draft.tags : '';
    slugInput.value = typeof draft.slug === 'string' ? draft.slug : '';
    bodyInput.value = typeof draft.body === 'string' ? draft.body : '';
    slugEdited = Boolean(slugInput.value);
    saveState.textContent = '저장된 초안을 불러왔습니다.';
  } catch {
    // A damaged browser draft must not prevent writing a new post.
  }
}

function updateFileName() {
  if (!titleInput.value.trim()) {
    fileName.textContent = '제목을 입력하면 표시됩니다.';
    return;
  }
  const { year, month, day } = seoulDateParts();
  fileName.textContent = `${year}-${month}-${day}-${slugInput.value || suggestedSlug(titleInput.value)}.md`;
}

function currentReview() {
  if (!slugInput.value.trim()) slugInput.value = suggestedSlug(titleInput.value);
  const review = createReview(readFields());
  updateFileName();
  return review;
}

function downloadReview() {
  let review;
  try {
    review = currentReview();
  } catch (error) {
    setStatus(error.message, 'error');
    return;
  }
  const url = URL.createObjectURL(new Blob([review.source], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = review.filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus('마크다운 파일을 내려받았습니다.', 'success');
}

function showPublishedLinks(review, commitSha) {
  const commitUrl = `https://github.com/${owner}/${repo}/commit/${commitSha}`;
  const postUrl = `https://${owner}.github.io/posts/${review.slug}/`;
  const commitLink = document.createElement('a');
  commitLink.href = commitUrl;
  commitLink.target = '_blank';
  commitLink.rel = 'noopener noreferrer';
  commitLink.textContent = 'GitHub 커밋 보기';
  const postLink = document.createElement('a');
  postLink.href = postUrl;
  postLink.target = '_blank';
  postLink.rel = 'noopener noreferrer';
  postLink.textContent = '배포 후 글 보기';
  links.replaceChildren(commitLink, postLink);
  links.hidden = false;
}

async function publishReview(event) {
  event.preventDefault();
  if (alreadyPublished) return;
  let review;
  try {
    review = currentReview();
  } catch (error) {
    setStatus(error.message, 'error');
    return;
  }
  if (!isPublishedSite) {
    setStatus('로컬 미리보기에서는 발행할 수 없습니다. 공개 사이트에서 글쓰기 화면을 열어 주세요.', 'error');
    return;
  }
  const token = tokenInput.value.trim();
  if (!token) {
    details.open = true;
    tokenInput.focus();
    setStatus('발행하려면 이 저장소에 Contents 쓰기 권한이 있는 GitHub 토큰을 입력해 주세요.', 'error');
    return;
  }

  publishButton.disabled = true;
  setStatus('GitHub에 글을 발행하고 있습니다…');
  try {
    const commitSha = await publishReviewToGitHub({ owner, repo, branch, review, token });
    alreadyPublished = true;
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Publishing succeeded even if browser storage is unavailable.
    }
    showPublishedLinks(review, commitSha);
    setStatus('글을 발행했습니다. 사이트에 나타나기까지 잠시 걸릴 수 있습니다.', 'success');
  } catch (error) {
    const message = error instanceof TypeError
      ? 'GitHub에 연결하지 못했습니다. 네트워크 연결을 확인해 주세요.'
      : (error.message || '발행 결과를 확인하지 못했습니다.');
    setStatus(message, 'error');
  } finally {
    tokenInput.value = '';
    if (!alreadyPublished) publishButton.disabled = false;
  }
}

restoreDraft();
updateFileName();

titleInput.addEventListener('input', () => {
  if (!slugEdited) slugInput.value = titleInput.value.trim() ? suggestedSlug(titleInput.value) : '';
  updateFileName();
});
slugInput.addEventListener('input', () => {
  slugEdited = Boolean(slugInput.value);
  updateFileName();
});
form.addEventListener('input', (event) => {
  if (event.target === tokenInput) return;
  if (alreadyPublished) {
    alreadyPublished = false;
    publishButton.disabled = false;
    links.hidden = true;
    links.replaceChildren();
  }
  saveDraft();
});
downloadButton.addEventListener('click', downloadReview);
form.addEventListener('submit', publishReview);
clearButton.addEventListener('click', () => {
  if (!confirm('이 브라우저에 저장된 초안과 현재 입력 내용을 지울까요?')) return;
  form.reset();
  tokenInput.value = '';
  localStorage.removeItem(draftKey);
  slugEdited = false;
  alreadyPublished = false;
  publishButton.disabled = false;
  links.hidden = true;
  links.replaceChildren();
  updateFileName();
  saveState.textContent = '새 초안을 시작할 수 있습니다.';
  setStatus('초안을 지웠습니다.');
  titleInput.focus();
});
