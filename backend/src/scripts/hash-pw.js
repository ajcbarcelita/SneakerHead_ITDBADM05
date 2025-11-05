// scripts/hash-pw.js
// Usage:
// 1) node scripts/hash-pw.js myPlainPassword
// 2) node scripts/hash-pw.js    -> will prompt you (masked) to type the password
//
// Make sure `argon2` is installed: `pnpm add argon2`

const argon2 = require('argon2');
const readline = require('readline');

async function hashPassword(pw) {
  return await argon2.hash(pw, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 5,
    parallelism: 1
  });
}

function promptMasked(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    // Hide input by overriding _writeToOutput
    const silent = (s) => {
      if (rl && rl.output) {
        rl.output.write('\x1B[2K\x1B[200D' + question + Array(rl.line.length + 1).join('*'));
      }
    };

    rl.question(question, (answer) => {
      rl.history = rl.history.slice(1);
      rl.close();
      // Move cursor to next line
      process.stdout.write('\n');
      resolve(answer);
    });

    // Replace default write to show stars
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) {
        silent(stringToWrite);
      } else {
        rl.output.write(stringToWrite);
      }
    };
    rl.stdoutMuted = true;
  });
}

async function main() {
  try {
    const arg = process.argv[2];

    let plain;
    if (arg) {
      plain = arg;
    } else {
      // interactive prompt (masked)
      plain = await promptMasked('Enter password: ');
    }

    if (!plain) {
      console.error('No password provided.');
      process.exit(1);
    }

    const hashed = await hashPassword(plain);
    // Print only the hashed password so you can copy it into your SQL insert
    console.log(hashed);
  } catch (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
}

main();
