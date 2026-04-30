const axios = require('axios');
const { execFileSync } = require('child_process');

function gitlabClient(url, token) {
  return axios.create({
    baseURL: `${url.replace(/\/$/, '')}/api/v4`,
    headers: {
      'PRIVATE-TOKEN': token,
      Accept: 'application/json',
    },
  });
}

function resolveGitlabProject(localPath) {
  let remoteUrl;
  try {
    remoteUrl = execFileSync('git', ['-C', localPath, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
    }).trim();
  } catch (err) {
    throw new Error(`Не удалось прочитать git remote в ${localPath}: ${err.message}`);
  }
  const projectPath = remoteUrl
    .replace(/^git@[^:]+:/, '')
    .replace(/^https?:\/\/[^/]+\//, '')
    .replace(/\.git$/, '');
  if (!projectPath || projectPath === remoteUrl) {
    throw new Error(`Не удалось разобрать GitLab-путь из remote: ${remoteUrl}`);
  }
  return projectPath;
}

async function getMrsForBranch({ url, token, projectPath, branch }) {
  const project = resolveGitlabProject(projectPath);
  const encoded = encodeURIComponent(project);
  const client = gitlabClient(url, token);

  const { data: mrs } = await client.get(`/projects/${encoded}/merge_requests`, {
    params: {
      source_branch: branch,
      state: 'all',
      order_by: 'updated_at',
      sort: 'desc',
      per_page: 20,
    },
  });

  const result = [];
  for (const mr of mrs) {
    const { data: notes } = await client.get(
      `/projects/${encoded}/merge_requests/${mr.iid}/notes`,
      { params: { per_page: 100, sort: 'asc' } }
    );
    const comments = notes
      .filter((n) => !n.system)
      .map((n) => ({
        id: n.id,
        author: n.author?.name || n.author?.username || 'Unknown',
        created: n.created_at,
        body: n.body || '',
        resolvable: !!n.resolvable,
        resolved: !!n.resolved,
      }));
    result.push({
      mr: {
        iid: mr.iid,
        title: mr.title,
        url: mr.web_url,
        state: mr.state,
        author: mr.author?.name || mr.author?.username || '',
        sourceBranch: mr.source_branch,
        targetBranch: mr.target_branch,
        updated: mr.updated_at,
      },
      comments,
    });
  }
  return { project, branch, mrs: result };
}

module.exports = { getMrsForBranch };
