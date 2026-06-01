export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { userCode, testCases = [], functionName = 'solution', language = 'javascript' } = req.body || {};
  if (!userCode) return res.status(400).json({ error: 'userCode required' });

  const tcJson = JSON.stringify(testCases);
  let fullCode;
  let pistonLang;
  let pistonVersion;

  if (language === 'python') {
    pistonLang = 'python';
    pistonVersion = '3.10.0';
    const pyFn = functionName;
    fullCode = `${userCode}

import json as _json
_tests = ${tcJson}
_passed = 0
_results = []
for i, tc in enumerate(_tests):
    try:
        _got = ${pyFn}(tc['input'])
        _ok = _got == tc['expected']
        if _ok:
            _passed += 1
        _results.append({'t': i+1, 's': 'PASS' if _ok else 'FAIL', 'got': repr(_got), 'exp': repr(tc['expected']), 'label': tc.get('label', '')})
    except Exception as e:
        _results.append({'t': i+1, 's': 'ERROR', 'err': str(e), 'label': tc.get('label', '')})
print(_json.dumps({'passed': _passed, 'total': len(_tests), 'results': _results}))`;
  } else {
    pistonLang = 'javascript';
    pistonVersion = '18.15.0';
    const jsFn = functionName;
    fullCode = `${userCode}

const _tests = ${tcJson};
let _passed = 0;
const _results = [];
_tests.forEach((tc, i) => {
  try {
    const _got = ${jsFn}(tc.input);
    const _ok = JSON.stringify(_got) === JSON.stringify(tc.expected);
    if (_ok) _passed++;
    _results.push({ t: i+1, s: _ok ? 'PASS' : 'FAIL', got: JSON.stringify(_got), exp: JSON.stringify(tc.expected), label: tc.label || '' });
  } catch(e) {
    _results.push({ t: i+1, s: 'ERROR', err: e.message, label: tc.label || '' });
  }
});
process.stdout.write(JSON.stringify({ passed: _passed, total: _tests.length, results: _results }));`;
  }

  try {
    const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: pistonVersion,
        files: [{ content: fullCode }],
      }),
    });

    if (!pistonRes.ok) {
      const err = await pistonRes.text();
      return res.status(502).json({ error: 'Piston error', detail: err });
    }

    const submission = await pistonRes.json();
    const stdout = (submission.run?.stdout || '').trim();
    const stderr = (submission.run?.stderr || '').trim();
    const exitCode = submission.run?.code ?? 0;

    if (exitCode !== 0) {
      return res.status(200).json({
        error: 'Runtime Error',
        stderr,
        stdout,
        passed: 0,
        total: testCases.length,
        results: [],
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      return res.status(200).json({
        error: 'Could not parse test output',
        stdout,
        stderr,
        passed: 0,
        total: testCases.length,
        results: [],
      });
    }

    res.status(200).json({
      passed: parsed.passed,
      total: parsed.total,
      results: parsed.results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
