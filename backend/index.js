// index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import fetch from 'node-fetch';
import { spawnSync } from 'child_process';
import { REGISTER_CANDIDATE_MUTATION,SUBMIT_RESPONSES_MUTATION,INSERT_TEST_SUMMARY_MUTATION } from './schema.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const HASURA_URL = 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = 'Civ22jHTO5XTnqkzcE4yiF3Bds0BezO2GDEEaGwxHwSGuitkhSZQmKUfROdBqdkX';
const HASURA_GRAPHQL_ENDPOINT = 'http://localhost:8080/v1/graphql';
// Axios client for Hasura
const hasuraClient = axios.create({
  baseURL: HASURA_URL,
  headers: {
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    'Content-Type': 'application/json',
  },
});

// 📨 POST /register
app.post('/register', async (req, res) => {
  const { name, candidate_id, email } = req.body;

  try {
    const response = await hasuraClient.post('', {
      query: REGISTER_CANDIDATE_MUTATION,
      variables: {
        name,
        candidate_id,
        email,
      },
    });

    console.log("📥 Hasura response:", JSON.stringify(response.data, null, 2));

    if (response.data.errors) {
      console.error("❌ GraphQL Errors:", JSON.stringify(response.data.errors, null, 2));
      return res.status(500).json({ error: 'GraphQL execution error', details: response.data.errors });
    }

    if (!response.data.data || !response.data.data.insert_registration_one) {
      console.error("❌ insert_registration_one is undefined in response");
      return res.status(500).json({ error: 'Failed to insert candidate (unexpected structure)' });
    }

    return res.status(201).json(response.data.data.insert_registration_one);
  } catch (error) {
    console.error('❌ Request error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to register candidate' });
  }
});

//submit-responses
app.post('/submit-responses', async (req, res) => {
  try {
    const { candidate_id, responses, started_at, ended_at } = req.body;
    console.log("✅ Payload received:", { candidate_id, responses, started_at, ended_at });

    if (!candidate_id || !responses || !started_at || !ended_at) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 1: Submit test responses to Hasura
    const responseMutation = `
      mutation SubmitResponses($candidate_id: Int!, $responses: jsonb!, $started_at: timestamptz!, $ended_at: timestamptz!) {
        insert_test_responses_one(object: {
          candidate_id: $candidate_id,
          responses: $responses,
          started_at: $started_at,
          ended_at: $ended_at
        }) {
          id
        }
      }
    `;

    const responseRes = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: responseMutation,
        variables: { candidate_id, responses, started_at, ended_at },
      }),
    });

    const result = await responseRes.json();
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return res.status(500).json({ error: result.errors });
    }

    const test_id = result.data.insert_test_responses_one.id;
    console.log("🧪 Test submitted with ID:", test_id);

    const scriptPath = path.resolve('./gemini/summary_model.py');

// Spawn Python process with responses sent via stdin
const pythonProcess = spawnSync('python', [scriptPath], {
  input: JSON.stringify(responses),
  encoding: 'utf-8',
  env: { ...process.env, GOOGLE_API_KEY: 'AIzaSyC7ibVzP-qqrH3GS5Q1NV56pRxOqLBukbs' }
});

if (pythonProcess.error) {
  console.error('❌ Python execution error:', pythonProcess.error);
  return res.status(500).json({ error: 'Python execution failed.' });
}

if (pythonProcess.stderr && pythonProcess.stderr.trim() !== '') {
  console.error('⚠️ Python stderr:', pythonProcess.stderr);
  return res.status(500).json({ error: 'Python script error.', detail: pythonProcess.stderr });
}

const summary = pythonProcess.stdout.trim();
console.log("📝 Summary generated:", summary);

// Step 3: Insert summary
const summaryRes = await fetch(HASURA_GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
  },
  body: JSON.stringify({
    query: INSERT_TEST_SUMMARY_MUTATION,
    variables: { candidate_id, test_id, summary },
  }),
});

const summaryResult = await summaryRes.json();

if (summaryResult.errors) {
  console.error('Error inserting summary:', summaryResult.errors);
  return res.status(500).json({ error: summaryResult.errors });
}

return res.status(200).json({
  message: 'Responses and summary submitted successfully',
  test_id,
  summary,
  summary_id: summaryResult.data.insert_test_summary_one.id
});

  } catch (err) {
    console.error('🔥 Server error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
