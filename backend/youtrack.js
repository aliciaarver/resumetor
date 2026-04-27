const axios = require("axios");

const STATUS_MAP = {
  "In Progress": "В работе",
  "Open": "В работе",
  "Требует доработок": "На доработку",
  "Reopened": "На доработку",
  "Testing": "Тестирование",
  "Ready for test": "Тестирование",
  "In Review": "Тестирование",
  "На тестировании": "Тестирование",
  "Fixed": "Готово",
  "Verified": "Готово",
  "Done": "Готово",
  "Closed": "Готово",
};

const ACTIVE = new Set(["В работе", "На доработку", "Тестирование", "Готово"]);

async function getTasks(token, url) {
  const YOUTRACK_TOKEN = token || process.env.YOUTRACK_TOKEN;
  const YOUTRACK_URL = url || process.env.YOUTRACK_URL;

  const response = await axios.get(`${YOUTRACK_URL}/api/issues`, {
    params: {
      query: "Assignee: me",
      fields: "id,idReadable,summary,customFields(name,value(name))",
      $top: 100,
    },
    headers: {
      Authorization: `Bearer ${YOUTRACK_TOKEN}`,
      Accept: "application/json",
    },
  });

  return response.data
    .map((issue) => {
      const stateField = issue.customFields?.find((f) => f.name === "State");
      const rawStatus = stateField?.value?.name || "";
      const status = STATUS_MAP[rawStatus];
      const readableId = issue.idReadable;

      return {
        id: readableId,
        title: issue.summary,
        status,
        branch: readableId,
        url: `${YOUTRACK_URL}/issue/${readableId}`,
      };
    })
    .filter((task) => ACTIVE.has(task.status));
}

async function getTaskDetails(taskId, token, url) {
  const YOUTRACK_TOKEN = token || process.env.YOUTRACK_TOKEN;
  const YOUTRACK_URL = url || process.env.YOUTRACK_URL;

  const fields = [
    "id,idReadable,summary,description,created,updated",
    "reporter(login,fullName)",
    "customFields(name,value(name,login,fullName,text))",
    "comments(id,created,text,deleted,author(login,fullName))",
  ].join(",");

  const response = await axios.get(`${YOUTRACK_URL}/api/issues/${taskId}`, {
    params: { fields },
    headers: {
      Authorization: `Bearer ${YOUTRACK_TOKEN}`,
      Accept: "application/json",
    },
  });

  const issue = response.data;

  const getField = (name) =>
    issue.customFields?.find((f) => f.name === name)?.value;

  const stateField = getField("State");
  const priorityField = getField("Priority");
  const typeField = getField("Type");
  const assigneeField = getField("Assignee");

  return {
    id: issue.idReadable,
    title: issue.summary,
    description: issue.description || "",
    created: issue.created,
    updated: issue.updated,
    url: `${YOUTRACK_URL}/issue/${issue.idReadable}`,
    status: STATUS_MAP[stateField?.name] || stateField?.name || "",
    priority: priorityField?.name || "",
    type: typeField?.name || "",
    assignee: assigneeField?.fullName || assigneeField?.login || "",
    reporter: issue.reporter?.fullName || issue.reporter?.login || "",
    comments: (issue.comments || [])
      .filter((c) => !c.deleted)
      .map((c) => ({
        id: c.id,
        author: c.author?.fullName || c.author?.login || "Unknown",
        created: c.created,
        text: c.text || "",
      })),
  };
}

function getColumns() {
  return ['В бэклоге', 'На доработку', 'В работе', 'Тестирование', 'Готово'];
}

module.exports = { getTasks, getTaskDetails, getColumns };
