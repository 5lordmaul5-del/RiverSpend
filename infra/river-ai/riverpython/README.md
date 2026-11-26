# RiverPython — runtime foundation (prototype)
RiverPython is a RiverSpend-owned project foundation using the Python language and interpreter. This is not a fork or replacement of Python itself.

Provides a small allowlisted action core, envelope metadata, and unit tests. It does not run arbitrary code, load plugins, access network, persist data, or expose an API server.

Run locally: `python -m unittest discover -s infra/river-ai/riverpython -p 'test_*.py'`
