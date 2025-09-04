# Core Types - Quick Reference

## Purpose
Shared TypeScript types and interfaces for SESHA API pipeline execution, source management, and usage tracking.

## Key Files
- `base.ts` - Core domain types: Source, LLMTokenUsage, configuration enums
- `step.ts` - Generic step request/response patterns for pipeline execution
- `pipeline.ts` - Pipeline configuration, metadata, and request/response types

## How It Works
1. `base.ts` defines fundamental types (Source, usage tracking, config enums)
2. `step.ts` provides generic patterns for individual pipeline steps
3. `pipeline.ts` combines base types into complete pipeline request/response structures
4. All types are exported for consumption by features and core modules

## Dependencies
- Uses: None (foundation layer)
- Used by: All features, core/usage, core/inngest

## Key Decisions
- Generic step types allow type-safe pipeline execution with custom context/output
- Source flags control processing behavior (verbatim copy, primary source, etc.)
- Usage tracking built into all LLM interactions for cost monitoring
- Pipeline requests bundle metadata, instructions, and sources for complete context
