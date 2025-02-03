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

export const GetRuleByGameId = async (boardgame_id: string): Promise<Rule[]> => {
  return new Promise((resolve, reject) => {
    const query: string = "SELECT * FROM boardgame_rules WHERE boardgame_id = ?";

    connection.query(query, [boardgame_id], (error, result: RowDataPacket[]) => {
      if (error) {  
        console.error("Error getting rule by id:", error);
        return reject("Failed to retrieve the rules of the boardgame");
      }

      resolve(result.length > 0 ? (result as Rule[]) : []); 
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

