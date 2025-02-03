import Rule from "@/models/history/RuleHistoryModel";

export const addRuleHistory = async (
  ruleId: number,
  history: {
    action: "create" | "update" | "delete";
    updated_by: number;
    changes?: Record<string, { oldValue: any; newValue: any }>;
  }
): Promise<void> => {
  const rule = await Rule.findOne({ rule_id: ruleId });

  if (!rule) {
    await Rule.create({
      rule_id: ruleId,
      histories: [history],
    });
    return;
  }

  rule.histories.push(history);
  rule.save();
};

export const getHistories = async (ruleId: number) => {
  const rule = await Rule.findOne({ rule_id: ruleId });
  return rule?.histories || [];
};
