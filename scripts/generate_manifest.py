#!/usr/bin/env python3
"""
scripts/generate_manifest.py
────────────────────────────
vendor_docs 디렉토리를 스캔해서 manifest.json을 생성합니다.
HTML이 manifest.json을 fetch하면 VENDOR_DOCS를 동적으로 구성할 수 있습니다.

사용법:
    cd <프로젝트 루트>
    python3 scripts/generate_manifest.py

파일 추가 후 이 스크립트를 실행하면 자동으로 반영됩니다.
"""

import json
import os
from pathlib import Path

# ── 설정 ─────────────────────────────────────────
ROOT = Path(__file__).parent.parent  # 프로젝트 루트
VENDOR_DIR = ROOT / 'docs' / 'vendor_docs'
OUTPUT = VENDOR_DIR / 'manifest.json'
HTML_BASE = '../docs/vendor_docs'  # HTML에서의 상대 경로 기준

# ── 타입 추론 규칙 ────────────────────────────────
def infer_type(name: str) -> str:
    n = name.lower()
    if any(k in n for k in ['user manual', 'ifu', 'quick start', 'training',
                             'programming manual', 'guide']):
        return 'manual'
    if any(k in n for k in ['api', 'sdk', 'software', 'service', 'examples',
                             'architecture', 'command', 'access', 'stack',
                             'mechanical', 'electrical', 'hardware', 'gripper',
                             'modbus', 'io table']):
        return 'spec'
    if any(k in n for k in ['spec', 'specification', 'datasheet', 'data sheet']):
        return 'datasheet'
    if any(k in n for k in ['sds', 'cert', 'certification', 'compliance']):
        return 'cert'
    return 'other'

# ── 로봇 폴더 → 표시 이름 매핑 ───────────────────
ROBOT_NAMES = {
    'gocart180': 'GoCart180',
    'rby1':      'RB-Y1',
    'spot':      'SPOT',
    'doosan':    'Doosan',
    'piper':     'PiPER',
    'gaemi':     '일개미/집개미',
    'cobot':     'COBOT',
    'vision60':  'Vision60',
    'gyde':      'GYDE',
    'novatek':   'Novatek',
    'orderpicking': '오더피킹',
    'mtomtech':  '엘리베이터/자동문',
}

# ── 언어 추론 ────────────────────────────────────
def infer_lang(name: str, path_str: str) -> str:
    n = (name + path_str).lower()
    if any(k in n for k in ['_ko', '_kr', '_kor', 'korean', '한국어']):
        return 'KO'
    if any(k in n for k in ['_en', '_eng', 'english']):
        return 'EN'
    # Default: check if name has Korean characters
    if any('\uAC00' <= c <= '\uD7A3' for c in name):
        return 'KO'
    return 'EN'

# ── 스캔 ─────────────────────────────────────────
docs = []
for pdf in sorted(VENDOR_DIR.rglob('*.pdf')):
    rel = pdf.relative_to(VENDOR_DIR)
    parts = rel.parts
    robot_folder = parts[0]
    robot_name = ROBOT_NAMES.get(robot_folder, robot_folder.capitalize())

    # 파일명에서 확장자 제거하고 이름으로 사용
    stem = pdf.stem

    # HTML에서의 경로 (../docs/vendor_docs/로 시작)
    html_path = f"{HTML_BASE}/{rel.as_posix()}"

    # 파일 크기
    try:
        size_mb = pdf.stat().st_size / 1024 / 1024
        size_str = f"~{size_mb:.1f}MB" if size_mb >= 0.1 else f"~{pdf.stat().st_size//1024}KB"
    except:
        size_str = ''

    docs.append({
        'vendorGroup': robot_folder,
        'robot': robot_name,
        'type': infer_type(stem),
        'lang': infer_lang(stem, rel.as_posix()),
        'name': stem,
        'path': html_path,
        'date': '—',
        'size': size_str,
    })

# ── 출력 ─────────────────────────────────────────
OUTPUT.write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"✅ manifest.json 생성 완료: {len(docs)}개 파일")
print(f"   경로: {OUTPUT}")

# ── VENDOR_DOCS 코드 스니펫도 출력 (HTML 직접 붙여넣기용) ──
print("\n── HTML VENDOR_DOCS 직접 복사용 스니펫 (최초 100자) ──")
for d in docs[:3]:
    print(f"  {{vendorGroup:'{d['vendorGroup']}', robot:'{d['robot']}', type:'{d['type']}', lang:'{d['lang']}', name:'{d['name'][:40]}', path:'{d['path'][:50]}...'}}")
print(f"  ... 총 {len(docs)}개")
