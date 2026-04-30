const axios = require('axios');
const { execFileSync } = require('child_process');

function githubClient(token) {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

function resolveGithubRepo(localPath) {
  let remoteUrl;
  try {
    remoteUrl = execFileSync('git', ['-C', localPath, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
    }).trim();
  } catch (err) {
    throw new Error(`Не удалось прочитать git remote в ${localPath}: ${err.message}`);
  }
  const cleaned = remoteUrl
    .replace(/^git@github\.com:/, '')
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\.git$/, '');
  const parts = cleaned.split('/');
  if (parts.length < 2 || cleaned === remoteUrl) {
    throw new Error(`Не удалось разобрать GitHub owner/repo из remote: ${remoteUrl}`);
  }
  const [owner, repo] = parts;
  return { owner, repo };
}

async function getPrsForBranch({ token, projectPath, branch }) {
  const { owner, repo } = resolveGithubRepo(projectPath);
  const client = githubClient(token);

  const { data: prs } = await client.get(`/repos/${owner}/${repo}/pulls`, {
    params: {
      head: `${owner}:${branch}`,
      state: 'all',
      sort: 'updated',
      direction: 'desc',
      per_page: 20,
    },
  });

  const result = [];
  for (const pr of prs) {
    const { data: comments } = await client.get(
      `/repos/${owner}/${repo}/issues/${pr.number}/comments`,
      { params: { per_page: 100 } }
    );
    const normalizedComments = comments.map((c) => ({
      id: c.id,
      author: c.user?.login || 'Unknown',
      created: c.created_at,
      body: c.body || '',
      resolvable: false,
      resolved: false,
    }));
    const state = pr.merged_at ? 'merged' : pr.state;
    result.push({
      mr: {
        iid: pr.number,
        title: pr.title,
        url: pr.html_url,
        state,
        author: pr.user?.login || '',
        sourceBranch: pr.head?.ref || '',
        targetBranch: pr.base?.ref || '',
        updated: pr.updated_at,
      },
      comments: normalizedComments,
    });
  }
  return { project: `${owner}/${repo}`, branch, mrs: result };
}

module.exports = { getPrsForBranch };
