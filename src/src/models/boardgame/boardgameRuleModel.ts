import connection from "@/config/database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Rule } from "@/types/models/Boardgame"
import { RuleStatus } from "@/types/models/Boardgame";


export const createARule  = async (title: string, boardgame_id: string, user_id: number, rule_url: string, lang: string, type: string,   desciption: string | undefined, RuleStaus: RuleStatus): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO boardgame_rules (title, boardgame_id, user_id, rule_url, language, type, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    connection.query(query, [title, boardgame_id, user_id, rule_url, lang, type, desciption, RuleStaus], (error, result: ResultSetHeader) => {
      if (error) {
        console.error("Error adding rule odf boardgame:", error);
        return reject("Fail to add new rule of boardgame");
      }
      const rule_id = result.insertId;
      resolve(rule_id);
    });
  });
};

export const GetRuleById = async (ruleId: string): Promise<Rule | null> => {
  return new Promise((resolve, reject) => {
    const query: string = "SELECT * FROM boardgame_rules WHERE rule_id = ?";

    connection.query(query, [ruleId], (error, result: RowDataPacket[]) => {
      if (error) {  
        console.error("Error getting rule by id:", error);
        return reject("Failed to retrieve the rule of the boardgame");
      }

      // console.log(result);
      if (result.length > 0) {
        resolve(result[0] as Rule);
      } else {
        resolve(null); 
      }
    });
  });
};

export const GetRuleByGameId = async (
  boardgame_id: string,
  limit: number = 10,
  offset: number = 0,
  status?: string
): Promise<Rule[]> => {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM boardgame_rules WHERE boardgame_id = ?`;
    const params: any[] = [boardgame_id];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    connection.query(query, params, (error, results: RowDataPacket[]) => {
      if (error) {  
        console.error("❌ Error getting rules by boardgame ID:", error);
        return reject("Failed to retrieve the rules of the boardgame");
      }

      resolve(results as Rule[]);
    });
  });
};


export const updateARule = async (
  ruleId: number,
  title: string,
  rule_url: string,
  language: string,
  type: string,
  description: string | undefined,
  status: RuleStatus
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE boardgame_rules
      SET title = ?, rule_url = ?, language = ?, type = ?, description = ?, status = ?
      WHERE rule_id = ?;
    `;
 
    connection.query(
      query,
      [title, rule_url, language, type, description, status, ruleId],
      (error) => {
        if (error) {
          console.error("Error updating rule of boardgame:", error);
          return reject("Failed to update the rule of boardgame.");
        }
        resolve();
      }
    );
  });
};

export const updateStatus = async (
  status: RuleStatus,
  ruleId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE boardgame_rules
      SET status = ?
      WHERE rule_id = ?;
    `;

    connection.query(
      query,
      [status, ruleId],
      (error) => {
        if (error) {
          console.error("Error updating status rule of boardgame:", error);
          return reject("Failed to update the rule of boardgame.");
        }
        resolve();
      }
    );
  });
};

export const DeleteRule = async (ruleId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM boardgame_rules
      WHERE rule_id = ?;
    `;

    connection.query(query, [ruleId], (error) => {
      if (error) {
        console.error("Error deleting rule from boardgame:", error);
        return reject("Failed to delete the rule from boardgame.");
      }
      resolve();
    });
  });
};

