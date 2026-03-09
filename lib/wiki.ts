export type WikiStep = {
  title: string;
  body: string;
};

export type WikiArticle = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  screenPath: string;
  purpose: string;
  relatedSections?: string[];
  steps: WikiStep[];
};

export const wikiArticles: WikiArticle[] = [
  {
    slug: "sign-in-and-access",
    title: "Sign In and Access",
    summary: "How a user enters the platform, confirms what they should see, and escalates access gaps without breaking accountability.",
    audience: "All employees",
    screenPath: "/signin",
    purpose: "Identity and access are part of project control. The platform only works if every action, issue, inspection, and approval is tied to a real individual with the right project membership.",
    steps: [
      {
        title: "Use the correct sign-in method for the environment",
        body: "Open the platform and go to Sign In. In production, the intended method is Microsoft 365 with your Halo account. In a private or development environment, Local Access may be visible; if it is, use the assigned role-based test credentials. Do not use a personal mailbox or shared generic account. When sign-in succeeds, confirm your name and role in the header."
      },
      {
        title: "Confirm project visibility before doing work",
        body: "After sign-in, review the Projects page and confirm the project workspaces you are supposed to support are visible. Authentication and project access are not the same thing. If you can sign in but your project is missing, that is a project membership problem, not a workflow problem."
      },
      {
        title: "Escalate access gaps correctly",
        body: "If a project, module, or function is missing, request a role and project membership review from the platform administrator or project manager. State the exact project, role, and company context you need. Do not work around the system through another person's account, because that destroys audit traceability and accountability."
      },
      {
        title: "Know what good access looks like",
        body: "A correct access posture means you can sign in as yourself, see the right project list, and recognize your role from the header. If any of those three are wrong, stop and correct access before entering project data. Bad access creates bad records and bad audit history."
      }
    ]
  },
  {
    slug: "project-dashboard",
    title: "Use the Project Dashboard",
    summary: "How to read the dashboard as a control room and move quickly into the queue that actually needs intervention.",
    audience: "Project managers, quality leaders, engineers, leadership",
    screenPath: "Projects > Open Workspace",
    purpose: "The dashboard exists to show what deserves attention first. It is not a passive status page and it is not proof of health by itself.",
    relatedSections: ["dashboard"],
    steps: [
      {
        title: "Start with the attention board, not the title card",
        body: "When you enter a workspace, read the attention board first. It tells you which records are late, escalated, rejected, or waiting on review. Its job is to decide where you go next: Issues, Actions, Deficiencies, Engineering, or another operational queue. If you already know which queue is burning and you keep reading the dashboard, you are delaying action."
      },
      {
        title: "Challenge ownership, not just counts",
        body: "Use KPI cards such as open issues, overdue actions, open deficiencies, engineering cycle time, and pass rate as entry points, not conclusions. Open the underlying queue and identify the owner, due date, age, and next move from the detail panel. Counts tell you scale. Ownership tells you whether the project is controlled."
      },
      {
        title: "Use the dashboard to set the order of the day",
        body: "The dashboard should change behavior. A PM should know where the day starts. Leadership should know which records require intervention. Reporting should use the same facts the dashboard is showing so the project narrative matches live data. If the dashboard does not alter what the team does next, it has become decoration."
      },
      {
        title: "Know what bad dashboard usage looks like",
        body: "Bad usage is admiring totals without opening the real records, calling a project healthy because overall counts are small, or skipping a single escalated blocker because it is hidden inside a low total. The dashboard is valuable only when it pushes you into the live queue that needs action now."
      }
    ]
  },
  {
    slug: "project-setup-and-accountability",
    title: "Set Up a Project Workspace",
    summary: "How to establish project structure and accountability so the app can support real execution control instead of becoming a generic tracker.",
    audience: "Project managers, administrators, leadership",
    screenPath: "Projects > Open Workspace > Setup",
    purpose: "Setup is where the project becomes governable. If structure and ownership are weak here, every downstream record becomes harder to classify, filter, challenge, and close.",
    relatedSections: ["setup"],
    steps: [
      {
        title: "Create the control header with real project language",
        body: "Enter the project code, formal project name, sponsor, manager, phase, and baseline health using the same language leadership and clients already use in reporting. If the workspace is named differently than the project is discussed in meetings, the platform will always feel disconnected from reality."
      },
      {
        title: "Load area, discipline, and system structure before the queues form",
        body: "Define the project areas, disciplines, and systems the field team actually uses every day. This is what allows issues, inspections, deficiencies, and engineering requests to be filtered by real field context. If users keep entering context only in the summary field, your structure is too weak or too awkward to use."
      },
      {
        title: "Assign project members by real responsibility, not title alone",
        body: "A role is not just a job title. It tells the system what the user can see, what they can update, and what they can approve. Before the workspace is considered active, you should be able to name who owns issue review, inspection verification, engineering support, reporting, and escalation management."
      },
      {
        title: "Know when setup is incomplete",
        body: "Setup is incomplete when work starts being logged before project structure exists, when users cannot tell which owner handles which workflow, or when teams still say 'we usually handle that in meetings' because the responsibility baseline is not explicit in the system."
      }
    ]
  },
  {
    slug: "stakeholder-management",
    title: "Manage Stakeholders and Visibility",
    summary: "How to keep the right people informed and involved without diluting ownership or turning the register into a contact list.",
    audience: "Project managers, consultants, leadership",
    screenPath: "Projects > Open Workspace > Stakeholders",
    purpose: "The stakeholder register should tell the team who can block, approve, accelerate, or distort the work. It is a control tool, not a mailing list.",
    relatedSections: ["stakeholders"],
    steps: [
      {
        title: "Register stakeholders by consequence, not by convenience",
        body: "Enter stakeholder name, organization, role, and communication posture with enough clarity that the team can explain why this person matters. Good entries identify whether the stakeholder can approve, block, accelerate, or materially alter the work. If the register cannot answer 'why do we care about this person,' it is just clerical data."
      },
      {
        title: "Set communication posture intentionally",
        body: "High influence and high interest stakeholders should appear in the correct reporting and escalation loops before the project is in crisis. Over-communicating to everyone weakens ownership. Under-communicating creates surprise and reactivity. The register should reduce both of those failure modes."
      },
      {
        title: "Use the register during actual escalation",
        body: "When an issue ages, a milestone slips, or a verification backlog grows, open the stakeholder view and decide who must be informed, who must decide, and who can unblock the path. The value of the register is not that it exists. The value is that it reduces guesswork when pressure rises."
      },
      {
        title: "Know when the stakeholder model has failed",
        body: "If escalation still depends on memory, side conversations, or broad distribution lists, the stakeholder plan is not doing its job. A good stakeholder model should make targeted engagement faster and ownership clearer, not heavier and more political."
      }
    ]
  },
  {
    slug: "work-packages-and-milestones",
    title: "Run WBS and Milestones",
    summary: "How to use planning views as execution controls instead of decorative schedule artifacts.",
    audience: "Project managers, leads, leadership",
    screenPath: "Projects > Open Workspace > WBS or Milestones",
    purpose: "WBS and milestone screens should help the team challenge progress, expose slippage, and trigger recovery action early.",
    relatedSections: ["wbs", "milestones"],
    steps: [
      {
        title: "Build work packages that can be challenged weekly",
        body: "Use the WBS to define work packages with a real owner and a meaning the field team recognizes. A good work package is specific enough to be challenged in weekly review. A bad work package is so broad that it can sit at '90 percent complete' for weeks without anyone being able to say what is actually left."
      },
      {
        title: "Treat milestones as commitment points",
        body: "Milestones matter because they concentrate consequence. Each milestone needs an owner, date, and current status, but that is not enough. When a milestone is at risk, the linked recovery actions or issues should be visible immediately. A milestone without a recovery path is just a calendar entry."
      },
      {
        title: "Convert planning drift into operational action",
        body: "When WBS progress or milestone status shows drift, create or update linked actions and issues immediately. Planning only helps execution when slippage changes behavior on the day it is detected. If the planning views generate commentary but not intervention, they are not performing their job."
      },
      {
        title: "Know the common WBS and milestone failure modes",
        body: "The most common failures are work packages that are too broad to challenge, milestone views that show risk without owner or recovery logic, and progress updates that never change what the team does next. If planning is not driving follow-through, it has become theater."
      }
    ]
  },
  {
    slug: "action-management",
    title: "Manage Action Items",
    summary: "How to create, assign, update, evidence, and close commitments so they become the backbone of accountability.",
    audience: "Project managers, consultants, discipline leads, engineers",
    screenPath: "Projects > Open Workspace > Actions",
    purpose: "The action queue exists to answer what is due, who owns it, how old it is, and what still blocks closure.",
    relatedSections: ["actions"],
    steps: [
      {
        title: "Create the action with a title that survives outside the meeting",
        body: "Open Actions and select New actions. Write the title as the required outcome or deliverable, not the meeting where it was discussed. Then enter owner, company, due date, priority, and summary. The summary should state the completion standard, not the meeting history. If the owner still has to ask what the action means, the record is not ready to save."
      },
      {
        title: "Keep one accountable owner and challenge age aggressively",
        body: "An action can involve many people, but it must have one primary owner. Use the status and owner filters to review aging or overdue work. Open the record and use the detail panel to confirm the next move. Overdue actions should create pressure and recovery discussion, not silent tolerance."
      },
      {
        title: "Use notes and evidence to make closure defensible",
        body: "When work progresses or conditions change, add a coordination note so the record reflects the latest truth. If a file, photo, markup, or deliverable proves the work is done, use Add Evidence. Only then should the record be moved toward closure. Closing an action because someone said 'handled' is weak control."
      },
      {
        title: "Know what a bad action system looks like",
        body: "Bad action management sounds like 'we all own it,' 'it was discussed in the meeting,' or 'I think that got handled.' If titles are vague, ownership is shared, and evidence is missing, the action list is giving the project false confidence."
      }
    ]
  },
  {
    slug: "issue-escalation",
    title: "Manage Issues and Escalations",
    summary: "How to log a real execution problem, expose its consequence, assign ownership, and escalate before the project absorbs avoidable damage.",
    audience: "Project managers, engineers, consultants, leadership",
    screenPath: "Projects > Open Workspace > Issues",
    purpose: "The issue queue is the control surface for active project problems. It is not a parking lot for vague concerns.",
    relatedSections: ["issues"],
    steps: [
      {
        title: "Create the issue only when it is a real active problem",
        body: "Open Issues and select New issues only when the problem is active and is already threatening progress, quality, readiness, or stakeholder confidence. Write the title as the problem statement, not the meeting reference. Enter owner, company, due date, priority, and summary. The summary should state the consequence, what is blocked, and what response is required next."
      },
      {
        title: "Separate involvement from ownership",
        body: "Many people may be involved in solving an issue, but one person must own status quality and escalation timing. That owner is responsible for keeping the record current, using notes to capture the latest facts, and ensuring the team can always answer who owns the next move. Group ownership is not ownership."
      },
      {
        title: "Escalate based on age and consequence, not emotion",
        body: "Review issue status, due date, and age routinely. If the problem is threatening a milestone, turnover event, or client confidence, escalate it rather than continuing passive follow-up. Use notes and evidence to show the current recovery path or leadership decision required. Escalation is not punishment. It is the mechanism for involving the right level of control."
      },
      {
        title: "Know when the issue queue is being misused",
        body: "The issue queue is being misused when future threats are logged there instead of Risks, when simple follow-up tasks are logged there instead of Actions, or when issues sit visibly aged with no changed behavior because everyone is waiting for the next meeting."
      }
    ]
  },  {
    slug: "risk-management",
    title: "Manage Risks",
    summary: "How to capture credible future threats while there is still time to mitigate them.",
    audience: "Project managers, discipline leads, leadership",
    screenPath: "Projects > Open Workspace > Risks",
    purpose: "The risk queue is the forward-looking control layer. It should expose uncertainty early enough to change behavior.",
    relatedSections: ["risks"],
    steps: [
      {
        title: "Register the threat before it becomes an issue",
        body: "Open Risks and create a record only when the problem is not active yet. Enter the title, owner, due date, and summary with enough precision that another lead can understand the threat, the trigger that would make it real, and the mitigation path. A good risk is specific enough to watch. A bad risk is just a general worry."
      },
      {
        title: "Make mitigation visible through action",
        body: "A risk register without visible mitigation is only a warning label. Use linked action items, review checkpoints, or decision paths so the team can see whether exposure is actually being reduced. Review high-priority or high-severity risks routinely and update notes when the trigger posture changes."
      },
      {
        title: "Convert the record when the threat becomes real",
        body: "When the trigger occurs and the threat becomes an active execution problem, move it into the issue workflow so it can be owned, aged, escalated, and reported correctly. Keeping a live blocker in the risk register hides seriousness and delays response discipline."
      },
      {
        title: "Know the common risk failures",
        body: "The most common failures are logging real issues as risks because they sound less severe, describing mitigation without any linked follow-through, and never reviewing the trigger again after the risk is created. A risk that never changes behavior is not being managed."
      }
    ]
  },
  {
    slug: "inspection-and-quality-control",
    title: "Run Inspections and Quality Control",
    summary: "How inspectors and quality leaders should capture the field condition, evidence it, and push the workflow forward when the result is not acceptable.",
    audience: "Inspectors, quality managers, PMs",
    screenPath: "Projects > Open Workspace > Inspections",
    purpose: "Inspection records are the field truth base. They should say what was checked, what was observed, and what next record must be created if the work is not acceptable.",
    relatedSections: ["quality", "inspections"],
    steps: [
      {
        title: "Create the inspection in the right field context",
        body: "Open Inspections and select New inspections. Enter the title, owner, company, due date, and summary so a reviewer can tell what was inspected and why it mattered. The title should describe the check, not just the location. If the record reads like a calendar reminder instead of a quality check, rewrite it."
      },
      {
        title: "Capture the result while the condition is still visible",
        body: "As soon as the walkdown is complete, open the live inspection record and add a coordination note stating what was observed, who was present, and whether the result passed or failed. Then use Add Evidence for photos, markups, or supporting files before the field condition changes. Delayed entry weakens evidence and creates room for argument."
      },
      {
        title: "Push failure into the next accountable record",
        body: "If the inspection result reveals a nonconformance, incomplete work, or unresolved blocker, create or update the related deficiency, issue, or action immediately. Inspection records are the start of closure discipline, not the end of it. A failed inspection with no downstream record is not controlled."
      },
      {
        title: "Know what weak inspection practice looks like",
        body: "Weak inspection practice means entering records long after the walkdown, relying on verbal memory instead of notes and evidence, or calling out a failed condition without creating the downstream control record that will drive closure."
      }
    ]
  },
  {
    slug: "deficiency-closure",
    title: "Drive Deficiency Closure",
    summary: "How to assign, evidence, verify, reject, and finally close a deficiency so closeout quality can withstand challenge.",
    audience: "Inspectors, quality managers, contractors, PMs",
    screenPath: "Projects > Open Workspace > Deficiencies",
    purpose: "The deficiency module exists to control corrective work to verified closure. It should make the responsible party, evidence, and verification state impossible to hide.",
    relatedSections: ["deficiencies"],
    steps: [
      {
        title: "Write the deficiency so the contractor cannot misread it",
        body: "Open Deficiencies and create the record with a clear title, location context, owner, responsible company, due date, and priority. The summary should describe what acceptable correction will look like. If the title could describe five different conditions, the record is too weak and will create argument instead of action."
      },
      {
        title: "Require evidence before verification",
        body: "When the responsible party claims completion, open the deficiency record, use Add Evidence for the photo package, markup, or closure file, and add a note stating what changed in the field and what still needs to be verified. Verification without evidence creates reopen cycles and destroys confidence in the closeout process."
      },
      {
        title: "Verify or reject with discipline",
        body: "Review the latest evidence and notes from the detail panel. If the correction is acceptable, move the record toward verified closure. If it is incomplete or unclear, reject it and record the reason in a note. The system should always show why a deficiency was accepted or rejected."
      },
      {
        title: "Know what bad deficiency control looks like",
        body: "Bad deficiency control shows up as vague titles, closure claims without evidence, and status changes with no usable explanation. If you cannot defend the closure from the record itself, the deficiency is not really closed."
      }
    ]
  },
  {
    slug: "engineering-support",
    title: "Manage Engineering Support Requests",
    summary: "How to route a technical question, get the right owner on it, and connect the answer back to the field without losing time.",
    audience: "Engineers, inspectors, PMs, consultants",
    screenPath: "Projects > Open Workspace > Engineering",
    purpose: "Engineering requests should shorten the cycle from field ambiguity to usable answer. They are not a holding pen for questions nobody owns.",
    relatedSections: ["engineering"],
    steps: [
      {
        title: "Log the technical question as a field problem, not as vague coordination",
        body: "Open Engineering and create a record that states the technical question or constraint clearly. Set owner, company, due date, and summary. The summary should describe the field condition and the decision or clarification required to move work. If the request still reads like 'please review,' it is not framed properly."
      },
      {
        title: "Make the answer traceable and usable",
        body: "Use notes to record the current response or technical disposition, and use Add Evidence for marked files or supporting documents when they are part of the answer. A technical answer that lives only in email or in someone's memory is not controlled, even if the engineer already knows what to do."
      },
      {
        title: "Connect the answer back to execution",
        body: "If the response changes field work, create or update the linked action, issue, or document record. The engineering request is only half complete until the answer has been handed back into execution. If the request is closed but the field still does not know what to do, it was closed too early."
      },
      {
        title: "Know the common engineering request failures",
        body: "The usual failures are vague requests that do not describe the field condition, real answers buried in email while the record stays stale, and requests being closed before the field has a usable path forward."
      }
    ]
  },
  {
    slug: "document-and-submittal-control",
    title: "Control Documents and Submittals",
    summary: "How to keep the active technical basis visible and prevent the field from running on stale or unapproved information.",
    audience: "Engineers, document controllers, PMs, consultants",
    screenPath: "Projects > Open Workspace > Documents",
    purpose: "The documents screen should tell users what is current, who still owes review, and which basis supports a live decision or issue.",
    relatedSections: ["documents"],
    steps: [
      {
        title: "Create the record so status is obvious",
        body: "Open Documents and create the document or submittal entry with a name, discipline, owner, current status, and summary that explains why the item matters to execution. Trust in document control comes from immediate clarity about whether an item is draft, in review, approved, or superseded."
      },
      {
        title: "Keep review and evidence inside the record",
        body: "Use notes to show who is reviewing or approving next, and use Add Evidence for revised files or support packages. Document control fails when the real review path happens outside the app and the record becomes a passive file label instead of the source of truth."
      },
      {
        title: "Protect the field from stale basis",
        body: "Before a document is treated as field-ready, confirm the current status inside the record. In-review items should not be treated like approved field basis. If people must ask around to know whether a document is approved, the workflow is not under control."
      },
      {
        title: "Know the common document control failures",
        body: "The common failures are uploading files without any status meaning, letting in-review items function as approved basis, and keeping the real approval conversation outside the system. If the field cannot trust the status, the module has failed."
      }
    ]
  },
  {
    slug: "meetings-and-decisions",
    title: "Run Meetings and Decisions with Discipline",
    summary: "How to turn meetings into accountable work, traceable decisions, and visible follow-up instead of dead minutes.",
    audience: "Project managers, consultants, leadership",
    screenPath: "Projects > Open Workspace > Meetings",
    purpose: "Meeting records are only valuable if they produce actions and defensible decisions after the call ends.",
    relatedSections: ["meetings"],
    steps: [
      {
        title: "Record the meeting while the discussion is current",
        body: "Open Meetings and create the record while the meeting is happening or immediately after it ends. Capture the title, date, and summary so another user can understand what was actually discussed. Meeting quality degrades fast when notes are written later from memory."
      },
      {
        title: "Convert commitments into actions before you leave the record",
        body: "If a meeting creates follow-up work, create the corresponding action items from the relevant module before you consider the meeting record complete. Use notes in the meeting record to reference what was created and why. If the meeting produced commitments but no tracked actions, the output is already aging invisibly."
      },
      {
        title: "Write decisions so they survive challenge",
        body: "A decision should state what changed, who owns it, and what it affects. If the matter is still unresolved, keep that visible through notes and linked follow-up. Projects lose time when people remember the same decision differently a week later."
      },
      {
        title: "Know what bad meeting control looks like",
        body: "Bad meeting control means vague notes written too late, action items left buried in minutes, and unresolved discussion being treated as if it were a final decision. If users still argue about what changed after reading the record, the meeting output is not good enough."
      }
    ]
  },
  {
    slug: "reporting-and-executive-visibility",
    title: "Publish Reports and Leadership Visibility",
    summary: "How to build daily, weekly, and executive reporting that matches the live control picture.",
    audience: "Project managers, consultants, leadership",
    screenPath: "Projects > Open Workspace > Reports",
    purpose: "Reports should synthesize live queues, not compete with them. Good reporting tells leadership what matters, who owns it, and what intervention is required.",
    relatedSections: ["reports"],
    steps: [
      {
        title: "Start from live records, not blank-page narrative",
        body: "Before creating a report, review the dashboard and the live queues for issues, actions, deficiencies, engineering requests, and milestone posture. Then open Reports and write a summary that matches what the system is actually showing. A report that disagrees with the live control picture is false, no matter how polished it sounds."
      },
      {
        title: "Lead with the exceptions that require attention",
        body: "Executives do not need a transcript of project activity. They need overdue accountability, escalated issues, verification backlog, major engineering blockers, and milestone risk. For each major exception, name the owner and the current response. The report should tell leadership what matters now and why."
      },
      {
        title: "Make the next move visible in the report",
        body: "For each major problem, state what is being done, what remains blocked, and what decision or intervention is required. Good reporting does not stop at describing the problem. It makes the next move visible so leadership can act."
      },
      {
        title: "Know what weak reporting looks like",
        body: "Weak reporting is written from memory, buries the real exceptions inside general commentary, or cannot be tied back to actual records. If the report creates more clarification questions than decisions, it is too vague."
      }
    ]
  },
  {
    slug: "admin-access-management",
    title: "Admin Access Management",
    summary: "How administrators provision users, assign memberships, and keep access aligned with accountability and auditability.",
    audience: "Platform administrators",
    screenPath: "Sidebar > Admin Users",
    purpose: "The admin console must keep the right people in the right projects with the right role and no broader access than necessary.",
    steps: [
      {
        title: "Create or update the directory user first",
        body: "Open Admin Users and use Step 1 to create or update the user's base record with name, email, title, company, and active state. The record must map to a real individual, never a shared mailbox. If a user is duplicated under different names or emails, access confusion starts immediately."
      },
      {
        title: "Assign project membership with intent",
        body: "Use Step 2 to choose the user, project, role, company, and approval posture. Project membership is the app's real authorization model, so assign only the projects the user actually needs and use the least broad role that still allows the work they must perform."
      },
      {
        title: "Review the resulting access posture in the user table",
        body: "After saving, review Current Users and confirm the status, company, and memberships match the request. When someone should no longer have access, mark them inactive rather than deleting them so audit history remains intact."
      },
      {
        title: "Know what bad access administration looks like",
        body: "Bad administration grants broad access because it is faster, leaves stale memberships in place after personnel changes, or encourages shared accounts because proper provisioning feels inconvenient. Those shortcuts create security risk and accountability confusion at the same time."
      }
    ]
  },
  {
    slug: "getting-started-project-manager",
    title: "Getting Started for Project Managers",
    summary: "The first-pass operating sequence for a PM running project execution from the platform.",
    audience: "Project managers",
    screenPath: "Sign In > Projects > Project Workspace",
    purpose: "This guide tells a PM what to do in order during the first week of platform adoption so the app becomes the control room instead of a side system.",
    steps: [
      { title: "Confirm access and project membership", body: "Sign in through Microsoft 365, confirm the correct project workspace is visible, and verify that Admin Users shows your PM membership if you have admin rights. If the workspace is missing, fix access before logging work through other channels." },
      { title: "Baseline the project workspace", body: "Open Setup, Stakeholders, WBS, and Milestones before chasing open issues. Confirm the project structure, accountabilities, and schedule posture reflect reality. A PM cannot govern from a workspace that is structurally wrong." },
      { title: "Run the daily control loop", body: "Start every day on the dashboard attention board, then move through Issues, Actions, Deficiencies, Engineering, and Reports in that order unless a higher-risk queue is burning. Your job is to challenge age, owner, and next move." },
      { title: "Use the app as the source of truth", body: "Push meeting commitments, escalation decisions, and report narratives back into the live records. If major project facts live outside the app, the PM loses the benefit of traceability and leadership visibility." }
    ]
  },
  {
    slug: "getting-started-quality-manager",
    title: "Getting Started for Quality Managers",
    summary: "How a quality lead should run verification, rejection, and deficiency closure from the platform.",
    audience: "Quality managers",
    screenPath: "Sign In > Project Workspace > Inspections / Deficiencies",
    purpose: "This guide makes the quality manager responsible for closure discipline, not just inspection volume.",
    steps: [
      { title: "Review live quality queues first", body: "Open Inspections, Deficiencies, and the dashboard attention board. Identify what is waiting for verification, what has been rejected, and which assets have open quality blockers." },
      { title: "Challenge evidence before closure", body: "Do not accept a closure claim without notes and evidence attached to the live record. Your role is to defend the verification decision from the record itself." },
      { title: "Use asset status as the quality outcome", body: "When a checklist or inspection is complete, update or confirm the asset status based on the configured client and ASHRAE/L1-L5 model. Quality leadership cares about asset readiness, not just checklist count." },
      { title: "Escalate verification backlog early", body: "If inspection or deficiency verification is aging, escalate it as a project control problem. Delayed quality verification hides readiness risk and creates bad closeout logic." }
    ]
  },
  {
    slug: "getting-started-inspector",
    title: "Getting Started for Inspectors",
    summary: "How inspectors should use the app in the field without degrading evidence quality.",
    audience: "Inspectors and technicians",
    screenPath: "Sign In > Project Workspace > Inspections",
    purpose: "This guide keeps field entry fast, factual, and tied to the asset or equipment being inspected.",
    steps: [
      { title: "Open the correct asset or equipment context", body: "Before recording an inspection or checklist, confirm the area, system, asset, and equipment type match what you are standing in front of. Wrong asset context creates bad status updates later." },
      { title: "Complete the checklist while the condition is visible", body: "Add notes and evidence immediately, not later. A checklist should represent the actual field condition at the time of inspection, with enough clarity to support closure or rejection." },
      { title: "Update the asset through the checklist outcome", body: "The goal is not just to mark a checklist complete. The goal is to move the asset status correctly based on the result, whether that means ready, failed, needs rework, or waiting for verification under the client’s status model." },
      { title: "Create the next record when the check fails", body: "If the checklist exposes a real problem, create or update the linked deficiency, issue, or action before leaving the workflow. A failed checklist without a closure path is only partial documentation." }
    ]
  },
  {
    slug: "getting-started-engineer",
    title: "Getting Started for Engineers",
    summary: "How engineers should respond to technical blockers without disconnecting from field execution.",
    audience: "Engineers",
    screenPath: "Sign In > Project Workspace > Engineering",
    purpose: "This guide makes the engineering response visible, timely, and usable by the field.",
    steps: [
      { title: "Start with engineering requests and linked issues", body: "Review Engineering and Issues together so you understand which technical items are just questions and which are already affecting execution." },
      { title: "Respond in the record, not only in email", body: "Use notes and evidence inside the engineering request so the answer survives turnover, audit, and handoff. Email can support the response, but it should not be the system of record." },
      { title: "Tie technical answers back to the asset and workflow", body: "If the answer changes how an asset should be inspected, commissioned, or released, update the downstream action, document, or quality workflow so the field has a usable next step." },
      { title: "Watch engineering cycle time", body: "If requests age, they become schedule problems. Use the dashboard and the engineering queue to keep response time visible and defendable." }
    ]
  },
  {
    slug: "getting-started-admin",
    title: "Getting Started for Administrators",
    summary: "The exact sequence for provisioning employee access and keeping rollout controlled.",
    audience: "Platform administrators",
    screenPath: "Sidebar > Admin Users",
    purpose: "This guide ensures the administrator controls platform authorization without relying on shared passwords or off-system tracking.",
    steps: [
      {
        title: "Create the first project workspace before assigning project memberships",
        body: "When the platform is new, begin on Projects and create the first project workspace. Membership assignment is project-specific. If you skip project creation, access setup becomes guesswork because there is nowhere to assign the employee."
      },
      { title: "Provision the employee record first", body: "Create the directory user by company email, name, company, and title. Do this before the first Microsoft login if possible so access is intentional rather than reactive." },
      { title: "Use active state and memberships together", body: "A user may be Active, Inactive, or Pending access depending on whether the profile is enabled and whether real project memberships exist. Do not treat sign-in success as sufficient proof that access is complete." },
      { title: "Assign only the projects and roles required", body: "Project membership is the actual authorization boundary. Use the least-broad role that still allows the employee to do the work." },
      { title: "Keep the wiki aligned with rollout reality", body: "When auth, provisioning, or role flows change, update the in-app guides immediately. If the wiki drifts from the production workflow, rollout support cost rises fast." }
    ]
  }
];

export const wikiArticleSlugBySection: Record<string, string> = {
  dashboard: "project-dashboard",
  setup: "project-setup-and-accountability",
  stakeholders: "stakeholder-management",
  wbs: "work-packages-and-milestones",
  milestones: "work-packages-and-milestones",
  actions: "action-management",
  issues: "issue-escalation",
  risks: "risk-management",
  quality: "inspection-and-quality-control",
  inspections: "inspection-and-quality-control",
  deficiencies: "deficiency-closure",
  engineering: "engineering-support",
  documents: "document-and-submittal-control",
  meetings: "meetings-and-decisions",
  reports: "reporting-and-executive-visibility"
};

export function getWikiArticle(slug: string) {
  return wikiArticles.find((article) => article.slug === slug) ?? null;
}

export function getWikiArticleForSection(section: string) {
  const slug = wikiArticleSlugBySection[section];
  return slug ? getWikiArticle(slug) : null;
}
