// schema.js
export const REGISTER_CANDIDATE_MUTATION = `
  mutation RegisterCandidate($name: String!, $candidate_id: String!, $email: String!) {
    insert_registration_one(object: {
      name: $name,
      candidate_id: $candidate_id,
      email: $email
    }) {
      id
      name
      candidate_id
      email
      created_at
    }
  }
`;

export const SUBMIT_RESPONSES_MUTATION = `
  mutation SubmitResponses($candidate_id: Int!, $responses: jsonb!, $started_at: timestamptz!, $ended_at: timestamptz!) {
    insert_test_responses_one(object: {
      candidate_id: $candidate_id,
      responses: $responses,
      started_at: $started_at,
      ended_at: $ended_at
    }) {
      id
      candidate_id
      responses
      started_at
      ended_at
      created_at
    }
  }
`;

export const INSERT_TEST_SUMMARY_MUTATION = `
  mutation InsertTestSummary($candidate_id: Int!, $test_id: Int!, $summary: String!) {
    insert_test_summary_one(object: {
      candidate_id: $candidate_id,
      test_id: $test_id,
      summary: $summary
    }) {
      id
      candidate_id
      test_id
      summary
      created_at
    }
  }
`;