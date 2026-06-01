import { QuickStart } from "./types";

export const QUICK_STARTS: QuickStart[] = [
  {
    label: "Name + fallback",
    prompt:
      "Add a personalized first name greeting to my email. If the name is missing, show 'Friend' instead.",
  },
  {
    label: "Monthly vs one-time",
    prompt:
      "Show different content to my monthly donors vs one-time donors. My monthly donor group ID is MONTHLY_GROUP_ID — I'll fill that in.",
  },
  {
    label: "Group conditional",
    prompt:
      "Show content only to members of a specific group. My group ID is GROUP_ID.",
  },
  {
    label: "OR logic — either group",
    prompt:
      "Show content to donors who are in either Group A (ID: GROUP_A_ID) OR Group B (ID: GROUP_B_ID).",
  },
  {
    label: "Three-way split",
    prompt:
      "Show three different messages based on donor level: one for major donors (Group ID: MAJOR_ID), one for mid-level donors (Group ID: MID_ID), and one for everyone else.",
  },
  {
    label: "Autoresponder thank-you",
    prompt:
      "Create a donation thank-you autoresponder that shows different content to monthly (recurring) donors vs one-time donors. Include the gift amount.",
  },
  {
    label: "City targeting",
    prompt:
      "Show a personalized message that includes the donor's city, but only if we have their city on file.",
  },
];
