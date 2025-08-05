import 'dotenv/config';
import { IgApiClient } from 'instagram-private-api';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

const SESSION_DIR = path.join('data');
const SESSION_FILE = path.join(SESSION_DIR, 'session.json');

(async () => {
  console.log('서버에서 사용할 영구 로그인 세션 파일을 생성합니다...');
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);

  // 1. 기존 세션 파일이 있다면 무조건 삭제
  await fs.remove(SESSION_FILE);
  console.log('기존 세션 파일을 삭제하고 새로 시작합니다.');

  // 2. 로그인 시도
  try {
    console.log('새로운 로그인을 시도합니다...');
    await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);
  } catch (e) {
    // 3. 보안 인증이 필요하면 코드 입력
    if (e.name !== 'IgCheckpointError') throw e;
    console.warn('인스타그램 보안 인증이 필요합니다. 이메일/SMS를 확인하세요.');
    await ig.challenge.auto(true);
    await ig.challenge.sendSecurityCode('123123');
  }

  // 4. 최종적으로 성공한 세션 정보를 파일에 저장
  const serialized = await ig.state.serialize();
  delete serialized.constants;
  await fs.ensureDir(SESSION_DIR);
  await fs.writeJson(SESSION_FILE, serialized);

  console.log('================================================================');
  console.log('✅ 성공! 영구 세션 파일이 data/session.json 에 생성되었습니다.');
  console.log('이제 이 파일을 서버의 프로젝트 폴더 안 data/ 디렉토리로 업로드하세요.');
  console.log('================================================================');
})();
