import { IgApiClient } from 'instagram-private-api';
import 'dotenv/config';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

const SESSION_DIR = path.join('data');
const SESSION_FILE = path.join(SESSION_DIR, 'session.json');

(async () => {
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);

  console.log('인스타그램 로그인 및 보안 인증을 시작합니다...');

  try {
    // 기존 세션이 있다면 삭제하고 새로 시작
    if (await fs.pathExists(SESSION_FILE)) {
        await fs.remove(SESSION_FILE);
        console.log('기존 세션 파일을 삭제했습니다.');
    }

    await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);
    console.log('기본 로그인 성공. 세션을 저장합니다.');

  } catch (e) {
    if (e.name === 'IgCheckpointError') {
      console.log('보안 인증이 필요합니다. 인스타그램에서 보낸 코드를 입력해주세요.');
      await ig.challenge.auto(true); // 자동으로 가장 선호되는 방법(이메일/SMS)을 선택
      const { code } = await inquirer.prompt([
        {
          type: 'input',
          name: 'code',
          message: '인증 코드를 입력하세요:',
        },
      ]);
      await ig.challenge.sendSecurityCode(code);
      console.log('인증 성공! 세션을 저장합니다.');
    } else {
      console.error('로그인 실패:', e);
      return;
    }
  }

  // 인증 성공 후 세션 저장
  const serialized = await ig.state.serialize();
  delete serialized.constants;
  await fs.ensureDir(SESSION_DIR);
  await fs.writeJson(SESSION_FILE, serialized);
  console.log('로그인 세션이 data/session.json 파일에 성공적으로 저장되었습니다.');
  console.log('이제 npm run test:scheduler를 실행하여 자동 포스팅을 시작할 수 있습니다.');
})();