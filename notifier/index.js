export async function sendTelegramDigest(jobs) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return;
  }

  const lines = jobs.map((job, i) =>
    `${i + 1}. *${job.title}* @ ${job.company}\n   ${job.location} | Score: ${job.score?.toFixed(2)}\n   ${job.url}`
  );

  const message = `*Job Radar Digest*\n\n${jobs.length} new jobs found:\n\n${lines.join('\n\n')}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    })
  });
}

export class Notifier {
  async notify(message) {
    console.log('Notification:', message);
  }
}
