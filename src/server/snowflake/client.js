import snowflake from 'snowflake-sdk';

function connect() {
  const cfg = {
    account:   process.env.SNOWFLAKE_ACCOUNT,
    username:  process.env.SNOWFLAKE_USER,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database:  process.env.SNOWFLAKE_DATABASE,
    schema:    process.env.SNOWFLAKE_SCHEMA,
  };
  if (process.env.SNOWFLAKE_PRIVATE_KEY_PATH) {
    cfg.privateKeyPath = process.env.SNOWFLAKE_PRIVATE_KEY_PATH;
  } else {
    cfg.password = process.env.SNOWFLAKE_PASSWORD;
  }
  const conn = snowflake.createConnection(cfg);
  return new Promise((resolve, reject) => {
    conn.connect((err, c) => (err ? reject(err) : resolve(c)));
  });
}

export async function fetchSnippets(topic, limit = 3) {
  const conn = await connect();
  const sql = `
    SELECT TOPIC, SUBTOPIC, TEXT, SOURCE
    FROM ENDO_KNOWLEDGE
    WHERE TOPIC = ?
    ORDER BY TRUST_SCORE DESC
    LIMIT ${limit}
  `;
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      binds: [topic],
      complete: (err, _stmt, rows) => {
        conn.destroy();
        if (err) return reject(err);
        resolve(rows || []);
      }
    });
  });
}

export async function fetchResources(region, limit = 3) {
  const conn = await connect();
  const sql = `
    SELECT NAME, PHONE, URL, TAGS
    FROM ENDO_RESOURCES
    WHERE REGION = ?
    ORDER BY TRUST_SCORE DESC
    LIMIT ${limit}
  `;
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      binds: [region],
      complete: (err, _stmt, rows) => {
        conn.destroy();
        if (err) return reject(err);
        resolve(rows || []);
      }
    });
  });
}
