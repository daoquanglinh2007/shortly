import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

function makeCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789';
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function isValidUrl(text) {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

app.get('/', (req, res) => {
  res.send('Shortly API is running');
});

app.post('/api/links', async(req, res) => {
  const { url, customCode } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Please enter a full URL starting with http:// or https://'});
  }

  let code = makeCode();
  if (customCode) {
    code = customCode.trim();
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(code)) {
      return res.status(400).json({ error: 'Alias must be 3 to 30 letters, numbers, dashes or underscores' });
    }
  }

  const existing = await prisma.link.findUnique({ where: { code } });

  if (existing) {
    return res.status(409).json({ error: `"${code}" is already taken. Try another alias.` });
  }

  const link = await prisma.link.create({ data: { code, url } });
  res.status(201).json({ ...link, shortUrl: `${BASE_URL}/${link.code}`});
});

app.get('/api/links', async(req, res) => {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { clicks: true } } },
  });

  const result = links.map((link) => ({
    code: link.code,
    url: link.url,
    createdAt: link.createdAt,
    clicks: link._count.clicks,
    shortUrl: `${BASE_URL}/${link.code}`,
  }));

  res.json(result);
});

app.get('/api/links/:code/stats', async(req, res) => {
  const link = await prisma.link.findUnique({
    where: { code: req.params.code },
    include: { clicks: true },
  });
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  const DAY = 24 * 60 * 60 * 1000; // one day in milliseconds
  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
    daily.push({ date, clicks: 0 });
  }

  // Put each click into its day, and count where clicks came from
  const referrerCounts = {};
  for (const click of link.clicks) {
    const date = click.createdAt.toISOString().slice(0, 10);
    const day = daily.find((d) => d.date === date);
    if (day) day.clicks += 1;

    const source = click.referrer || 'Direct';
    referrerCounts[source] = (referrerCounts[source] || 0) + 1;
  }

  const topReferrers = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    code: link.code,
    url: link.url,
    shortUrl: `${BASE_URL}/${link.code}`,
    totalClicks: link.clicks.length,
    daily,
    topReferrers,
  });
});

app.delete('/api/links/:code', async(req, res) => {
  const link = await prisma.link.findUnique( { where: {code: req.params.code} } );
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }
  await prisma.click.deleteMany({ where: { linkId: link.Id } });
  await prisma.link.delete({ where: { id: link.Id } });

  res.status(204).end();
})

app.get('/:code', async(req, res) => {
  const link = await prisma.link.findUnique({ where: { code: req.params.code } });
  if (!link) {
    return res.status(404).send('Short link not found');
  }
  await prisma.click.create({
    data: {
      linkId: link.id,
      referrer: req.get('referrer') || null,
      userAgent: req.get('user-agent') || null,
    },
  });
  res.redirect(302, link.url);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Shortly API running at ${BASE_URL}`);
});