# API Contract

## Step 3 & 4: Complaint Intake & Analyze
`POST /api/v1/complaints/analyze`
Returns AI analysis + `analysisToken` (Step 4 integration pending).

## Step 5: Complaint Submission
`POST /api/v1/complaints`
Accepts `analysisToken` from Step 4.
*(Step 5 — pending Step 4 integration)*
