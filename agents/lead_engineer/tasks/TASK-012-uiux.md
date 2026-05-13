[작업 완료 기록]
작업 ID: TASK-012
담당자: UI/UX Designer (Frontend)
완료일: 2026-05-13
결과: Admin 페이지에 담당자/협력업체 CRUD 패널 추가
변경 파일: public/index.html
이슈: 없음
인수 사항:
- 관리자 탭에 '담당자 관리', '협력업체 관리' 두 탭 추가됨
- 담당자 추가/수정/삭제: Supabase contacts 테이블에 직접 반영
- 협력업체 담당자 추가/수정/삭제: Supabase partner_contacts 테이블에 직접 반영
- STAR/ITP 오브젝트에 _id (Supabase row id) 필드 추가됨 — 수정/삭제 식별에 사용
- 담당자 카드(Contact 탭)에 어드민 로그인 시 ✏️/🗑️ 버튼 노출
- PARTNER_CONTACTS global도 setSupabasePartnerData 호출 시 동기화됨
- 미구현: 협력업체 회사(partner_companies) CRUD, 로봇 CRUD (Phase 2)
