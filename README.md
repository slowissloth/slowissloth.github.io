# 늘보의 음악평론

![늘보 로고](https://png.pngtree.com/png-vector/20240129/ourmid/pngtree-cute-brown-sloth-png-image_11566692.png)

## 소개

음악을 천천히 듣고 소리와 감상을 기록할 블로그입니다. 기존 글을 정리하고 새 음악평론을 처음부터 쓰는 중입니다.

[Link : https://slowissloth.github.io/](https://slowissloth.github.io/)

## 현재 글

- 업무 스케줄: 홈페이지 맨 위에 고정
- 음악평론: 새 글을 작성할 예정

## 기술 스택

- Jekyll
- Chirpy 테마

## 로컬 개발

Ruby 3.3.4, Bundler, Node.js, npm, Git이 필요합니다. `rbenv`를 사용하는 경우
저장소의 `.ruby-version`이 Ruby 버전을 선택합니다.

```bash
git clone --recurse-submodules https://github.com/slowissloth/slowissloth.github.io.git
cd slowissloth.github.io
rbenv exec bundle install # rbenv를 사용하지 않으면 bundle install
npm install
npm run build
bash tools/run.sh
```

브라우저에서 <http://127.0.0.1:4000>을 열면 됩니다. 글은 `_posts/`, 소개 페이지는
`_tabs/about.md`, 사이트 설정은 `_config.yml`에서 수정할 수 있습니다. JavaScript를
수정했다면 `npm run build`를 다시 실행하세요. 배포용 생성 및 검사는
`bash tools/test.sh`로 확인할 수 있습니다.

## 새 음악평론 쓰기

홈페이지의 **글쓰기** 버튼에서 초안을 작성할 수 있습니다. 초안은 현재 브라우저에만
저장됩니다. **마크다운 내려받기**는 GitHub 권한 없이 사용할 수 있습니다.

사이트에서 바로 발행하려면 GitHub의 fine-grained personal access token을
발행 시 입력해야 합니다. 토큰의 대상 저장소는
`slowissloth/slowissloth.github.io` 하나로 제한하고, Repository permissions에서
**Contents: Read and write**만 허용하세요. 토큰은 사이트나 브라우저 저장소에
보관하지 않습니다. 발행하면 `master` 브랜치의 `_posts/`에 새 글이 커밋됩니다.

직접 파일을 만들려면 `_posts/YYYY-MM-DD-title.md`에 아래 내용으로 시작하세요.

```markdown
---
title: "곡명 - 아티스트"
categories: [음악평론]
tags: [장르]
---

여기에 새 평론을 작성합니다.
```

## 기여하기

음악에 관한 의견이나 사이트 개선 사항이 있다면 언제든 PR을 보내주세요!

## 연락처

- 이메일: 1996yyk@gmail.com

## 라이선스

© 2024 SlowisSloth. Some rights reserved.
