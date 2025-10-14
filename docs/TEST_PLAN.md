# 테스트 계획 (Test Plan)

## 기본 라우팅 테스트
- [ ] 홈 페이지(`/`) 정상 렌더링
- [ ] 에디터 로그인 페이지(`/editor`) 정상 렌더링
- [ ] 에디터 대시보드(`/editor/dashboard`) 인증 후 접근 가능
- [ ] 404 페이지 동작 확인

## 홈 페이지 섹션별 테스트
- [ ] **HeroSection**: 카운트다운 타이머가 실시간으로 업데이트됨
- [ ] **MediaSection**: 미디어 자산 목록 표시 (기본 플레이스홀더 포함)
- [ ] **LocationSection**: 장소 정보 및 지도 플레이스홀더 표시
- [ ] **MessageSection**: 메시지 목록 조회 및 작성 가능
- [ ] **FooterSection**: 신랑/신부 정보 및 클릭 시 `/editor`로 이동

## React Query 통합 테스트
- [ ] 콘솔에 "No QueryClient set" 에러가 **출력되지 않음**
- [ ] useQuery를 사용하는 모든 컴포넌트가 정상 렌더링됨:
  - HeroSection (invitation 데이터)
  - MediaSection (media_assets 데이터)
  - LocationSection (venue 데이터)
  - MessageSection (messages 데이터)
  - FooterSection (invitation 데이터)
- [ ] 화면이 하얗게 나오지 않음 (Blank screen 없음)
- [ ] 데이터 로딩 중 상태 처리 정상

## 메시지 보드 기능 테스트
- [ ] "신랑"/"신부" 토글 버튼 동작
- [ ] 메시지 목록 페이지네이션 (5개씩, 페이지 번호 클릭)
- [ ] 메시지 작성 폼 제출 성공
- [ ] 비밀번호 해싱 후 저장 확인
- [ ] 작성 후 목록 자동 갱신

## 인증 테스트
- [ ] `/editor`에서 로그인 (admin@admin.com / 1234)
- [ ] 로그인 성공 시 `/editor/dashboard`로 리다이렉트
- [ ] 비관리자 계정 로그인 시 에러 메시지
- [ ] 로그아웃 후 홈으로 이동

## 빌드 테스트
- [ ] `npm run build` 성공
- [ ] TypeScript 타입 에러 없음
- [ ] 번들 크기 확인
- [ ] 프로덕션 빌드 실행 시 정상 동작

## Supabase 연동 테스트
- [ ] 데이터베이스 테이블 생성 확인
- [ ] RLS 정책 적용 확인
- [ ] 인증 플로우 정상 동작
- [ ] 실시간 업데이트 (선택사항)

## 회귀 테스트 체크리스트
- [ ] 기존 기능 정상 동작
- [ ] 성능 저하 없음
- [ ] 메모리 누수 없음
- [ ] 콘솔 경고/에러 없음
