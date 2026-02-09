## Ralph CLI Validation

Ralph Orchestrator was executed using a project-local configuration
with the opencode backend and a local Ollama provider.

The agent successfully entered the event loop, processed the prompt,
used its scratchpad, and terminated upon detecting the completion promise.

Execution logs are available under artifacts/ralph.


## System Monitoring Agent

RO-LCP defines a system monitoring agent powered by Ralph Orchestrator.
The agent executes real Linux commands to collect CPU, memory and disk metrics
and outputs structured JSON following a strict execution contract.
