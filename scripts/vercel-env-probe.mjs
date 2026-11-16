console.log(
  JSON.stringify({
    cronLen: process.env.CRON_SECRET?.length ?? 0,
    authLen: process.env.AUTH_SECRET?.length ?? 0,
    resendLen: process.env.RESEND_API_KEY?.length ?? 0,
    dbHost: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).hostname.split("-pooler")[0].slice(0, 24)
      : null,
  }),
);
