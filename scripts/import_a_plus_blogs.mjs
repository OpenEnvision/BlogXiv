#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogMdPath = path.join(repoRoot, 'blog.md');
const appPath = path.join(repoRoot, 'site/assets/js/app.js');
const coverDir = path.join(repoRoot, 'site/assets/img/covers/a-plus');
const upsertPath = path.join(repoRoot, 'admin/upsert-a-plus-blogs.sql');

const categories = new Set([
  'Foundation Model',
  'LLM & MLLM',
  'Multimodal Model',
  'Visual Generation',
  'World Model',
  'AI Agents',
  'Efficient AI',
  'Trustworthy AI',
  'Research Craft',
  'Frontier',
  'How to Research'
]);

const categoryPalettes = {
  'Foundation Model': ['#f8fafc', '#dbeafe', '#2563eb', '#0f172a'],
  'LLM & MLLM': ['#f9fafb', '#e0e7ff', '#4f46e5', '#111827'],
  'Multimodal Model': ['#f8fafc', '#cffafe', '#0891b2', '#0f172a'],
  'Visual Generation': ['#fff7ed', '#fed7aa', '#ea580c', '#1f2937'],
  'World Model': ['#f0fdf4', '#bbf7d0', '#16a34a', '#102338'],
  'AI Agents': ['#f7fee7', '#d9f99d', '#65a30d', '#1a2e05'],
  'Efficient AI': ['#f8fafc', '#ddd6fe', '#7c3aed', '#111827'],
  'Trustworthy AI': ['#fff1f2', '#fecdd3', '#e11d48', '#111827'],
  'Research Craft': ['#f8fafc', '#e5e7eb', '#475569', '#111827'],
  Frontier: ['#f5f3ff', '#c4b5fd', '#6d28d9', '#111827'],
  'How to Research': ['#fefce8', '#fde68a', '#ca8a04', '#1f2937']
};

const explicitMetadata = {
  'Scaling Pedagogical Pre-training: From Optimal Mixing to 10 Billion Tokens': {
    author: 'Asankhaya Sharma',
    sourceName: 'CodeLion',
    publishDate: '2026-03-06',
    readTime: '12 min read',
    tags: ['Pretraining Data', 'Dataset Mixing', 'Curriculum Learning', 'Open Training'],
    excerpt: 'Asankhaya Sharma scales a controlled pedagogical pretraining study from optimal dataset mixing to 10.2B tokens of generated education data, documenting quality filtering, training choices, and limitations of small-model validation.'
  },
  'Introducing LLM360: Fully Transparent Open-Source LLMs': {
    author: 'LLM360 Team',
    sourceName: 'LLM360',
    publishDate: '2023-12-11',
    readTime: '10 min read',
    tags: ['Open Source LLMs', 'Training Transparency', 'Datasets', 'Checkpoints'],
    excerpt: 'LLM360 introduces a fully transparent open-source LLM effort that releases training artifacts, data documentation, intermediate checkpoints, and recipes for studying foundation model development end to end.'
  },
  'Investigating pretraining dynamics and stability with OLMo checkpoints': {
    author: 'Ai2',
    sourceName: 'Ai2 Blog',
    publishDate: '2024-07-18',
    readTime: '10 min read',
    tags: ['OLMo', 'Pretraining Dynamics', 'Checkpoints', 'Training Stability'],
    excerpt: 'Ai2 uses OLMo checkpoints to inspect pretraining dynamics and stability, showing how transparent intermediate artifacts make it possible to study loss behavior, representation change, and training failures.'
  },
  'Internal Investigation of Sparse Token Forgetting': {
    author: 'MiniMax',
    sourceName: 'MiniMax Blog',
    publishDate: '2026-05-26',
    readTime: '12 min read',
    tags: ['Sparse Token Forgetting', 'Tokenization', 'Long Tail Tokens', 'Language Models'],
    excerpt: 'MiniMax investigates sparse token forgetting in language models, analyzing how rare or undertrained tokens can degrade capability and what the failure mode reveals about token distributions and post-training behavior.'
  },
  'Efficient Language Models as Arithmetic Circuits': {
    author: 'Stanford Hazy Research',
    sourceName: 'Hazy Research',
    publishDate: '2024-06-22',
    readTime: '18 min read',
    tags: ['Language Models', 'Arithmetic Circuits', 'Efficient Models', 'Theory'],
    excerpt: 'Stanford Hazy Research connects efficient language models with arithmetic circuits, giving a theoretical lens for understanding sequence modeling, expressivity, and architectural efficiency.'
  },
  'The Illustrated Retrieval Transformer': {
    author: 'Jay Alammar',
    sourceName: 'Jay Alammar',
    publishDate: '2024-04-11',
    readTime: '20 min read',
    tags: ['Retrieval', 'Transformers', 'Illustrated Guide', 'Language Models'],
    excerpt: 'Jay Alammar visually explains retrieval transformers, showing how retrieval-augmented sequence models combine external memory, nearest-neighbor lookup, and transformer computation.'
  },
  'Vision Language Models (Better, Faster, Stronger)': {
    author: 'Hugging Face Community Team',
    sourceName: 'Hugging Face Blog',
    publishDate: '2025-06-03',
    readTime: '18 min read',
    tags: ['Vision-Language Models', 'Open Models', 'Multimodal AI', 'Model Survey'],
    excerpt: 'The Hugging Face community surveys the modern VLM ecosystem, organizing open vision-language models by capability, efficiency, evaluation behavior, and deployment tradeoffs.'
  },
  'One Adapter, Both Modalities: Field Notes from Building and Serving a Multimodal Reranker': {
    author: 'LightOn AI',
    sourceName: 'Hugging Face Blog',
    publishDate: '2026-01-06',
    readTime: '14 min read',
    tags: ['Multimodal Reranking', 'Adapters', 'Serving', 'Retrieval'],
    excerpt: 'LightOn AI shares field notes from building and serving a multimodal reranker with a shared adapter, covering representation alignment, retrieval quality, and production serving constraints.'
  },
  'Generative Modelling in Latent Space': {
    author: 'Sander Dieleman',
    sourceName: 'Sander Dieleman',
    publishDate: '2025-04-15',
    readTime: '35 min read',
    tags: ['Latent Diffusion', 'Generative Models', 'Representation Learning', 'Model Design'],
    excerpt: 'Sander Dieleman analyzes latent-space generative modeling through latent capacity, reconstructability, shaping, and end-to-end objectives, clarifying why latent choices matter for diffusion and beyond.'
  },
  'Generative Modeling by Estimating Gradients of the Data Distribution': {
    author: 'Yang Song',
    sourceName: 'Yang Song',
    publishDate: '2021-05-07',
    readTime: '24 min read',
    tags: ['Score-Based Models', 'Diffusion Models', 'Langevin Dynamics', 'Generative Modeling'],
    excerpt: 'Yang Song builds the intuition behind score-based generative modeling, connecting score matching, noise perturbations, Langevin dynamics, and the gradient field of the data distribution.'
  },
  'Bringing 3D Shoppable Products Online with Generative AI': {
    author: 'Google Research',
    sourceName: 'Google Research Blog',
    publishDate: '2026-07-09',
    readTime: '12 min read',
    tags: ['3D Generation', 'NeRF', 'View-Conditioned Diffusion', 'Product Imaging'],
    excerpt: 'Google Research explains a multi-generation path from NeRF to view-conditioned diffusion and Veo-style systems for turning sparse product imagery into consistent shoppable 3D views.'
  },
  'Open-Sourcing Touch Representations and Models for Robot Dexterity': {
    author: 'Meta AI',
    sourceName: 'Meta AI Blog',
    publishDate: '2024-11-01',
    readTime: '10 min read',
    tags: ['Robot Dexterity', 'Tactile Sensing', 'Embodied AI', 'Open Models'],
    excerpt: 'Meta AI open-sources touch representations and tactile models for robot dexterity, connecting physical sensing, representation learning, and manipulation capabilities.'
  },
  'PARTNR and New Models for Human-Robot Collaboration': {
    author: 'Meta AI',
    sourceName: 'Meta AI Blog',
    publishDate: '2024-10-18',
    readTime: '12 min read',
    tags: ['Human-Robot Collaboration', 'Embodied AI', 'Planning', 'World Models'],
    excerpt: 'Meta AI introduces PARTNR and related models for human-robot collaboration, emphasizing shared task planning, embodied interaction, and evaluation of assistants in simulated homes.'
  },
  'MolmoMotion: Language-Guided 3D Motion Forecasting': {
    author: 'Ai2',
    sourceName: 'Ai2 Blog',
    publishDate: '2026-06-17',
    readTime: '10 min read',
    tags: ['Motion Forecasting', '3D Worlds', 'Language Guidance', 'Embodied AI'],
    excerpt: 'Ai2 presents MolmoMotion for language-guided 3D motion forecasting, linking multimodal instructions with physically grounded predictions of how scenes and actors move.'
  },
  'Quantifying Infrastructure Noise in Agentic Coding Evals': {
    author: 'Gian Segato',
    sourceName: 'Anthropic Engineering',
    publishDate: '2026-02-05',
    readTime: '14 min read',
    tags: ['Agent Evals', 'Coding Agents', 'Infrastructure Noise', 'Benchmarking'],
    excerpt: 'Anthropic quantifies how CPU, memory, storage, and network limits change coding-agent evaluation scores, arguing that infrastructure must be treated as an explicit benchmark variable.'
  },
  'Is It Agentic Enough? Benchmarking Open Models on Your Own Tooling': {
    author: 'Hugging Face Maintainers',
    sourceName: 'Hugging Face Blog',
    publishDate: '2026-01-15',
    readTime: '16 min read',
    tags: ['Agent Benchmarks', 'Open Models', 'Tool Use', 'Evaluation'],
    excerpt: 'Hugging Face maintainers benchmark open models on custom tooling, showing how agentic behavior depends on tool interface design, model choice, and task instrumentation.'
  },
  'Continuous Batching from First Principles': {
    author: 'Hugging Face Engineering',
    sourceName: 'Hugging Face Blog',
    publishDate: '2025-11-25',
    readTime: '18 min read',
    tags: ['Continuous Batching', 'KV Cache', 'LLM Inference', 'Scheduling'],
    excerpt: 'Hugging Face Engineering derives continuous batching from first principles, explaining prefill/decode scheduling, attention work, KV-cache pressure, and why naive batching wastes serving capacity.'
  },
  'Run High-Performance LLM Inference Kernels from NVIDIA Using FlashInfer': {
    author: 'NVIDIA, University of Washington, CMU et al.',
    sourceName: 'NVIDIA Technical Blog',
    publishDate: '2025-06-13',
    readTime: '12 min read',
    tags: ['FlashInfer', 'LLM Inference', 'CUDA Kernels', 'Serving'],
    excerpt: 'NVIDIA and collaborators introduce FlashInfer as an engine-independent kernel stack for attention, GEMM, communication, sampling, and other high-performance LLM inference primitives.'
  },
  'Training MoEs at Scale with PyTorch': {
    author: 'PyTorch and Databricks',
    sourceName: 'PyTorch Blog',
    publishDate: '2024-06-23',
    readTime: '16 min read',
    tags: ['Mixture of Experts', 'PyTorch', 'Distributed Training', 'Expert Parallelism'],
    excerpt: 'PyTorch and Databricks break down large-scale MoE training with dropless sparse kernels, expert parallelism, 3D device meshes, elastic checkpointing, and cluster-level tradeoffs.'
  },
  'A First Comprehensive Study of TurboQuant: Accuracy and Performance': {
    author: 'Red Hat AI and vLLM',
    sourceName: 'vLLM Blog',
    publishDate: '2026-05-11',
    readTime: '14 min read',
    tags: ['TurboQuant', 'Quantization', 'vLLM', 'Inference Performance'],
    excerpt: 'Red Hat AI and vLLM evaluate TurboQuant across dense and MoE models, measuring accuracy, throughput, and long-context behavior while reporting where extreme compression helps or fails.'
  },
  'High-Performance LLM Inference': {
    author: 'Modal Engineering',
    sourceName: 'Modal Docs',
    publishDate: '2026-01-01',
    readTime: '22 min read',
    tags: ['LLM Inference', 'Serving', 'GPU Optimization', 'Production Systems'],
    excerpt: 'Modal provides a production-oriented guide to high-performance LLM inference, covering batching, model loading, GPU utilization, quantization, caching, and serving architecture.'
  },
  'Achieve State-of-the-Art Inference Latencies with Speculative Decoding': {
    author: 'Charles Frye and Shankha Biswas',
    sourceName: 'Modal Blog',
    publishDate: '2026-01-01',
    readTime: '12 min read',
    tags: ['Speculative Decoding', 'LLM Inference', 'Latency', 'Serving'],
    excerpt: 'Modal demonstrates speculative decoding in production settings, showing how draft models and verification can reduce latency while preserving output correctness.'
  },
  'FlashAttention: Fast Transformer Training with Long Sequences': {
    author: 'Stanford Hazy Research',
    sourceName: 'Hazy Research',
    publishDate: '2023-01-12',
    readTime: '16 min read',
    tags: ['FlashAttention', 'Attention Kernels', 'Long Context', 'Transformer Training'],
    excerpt: 'Stanford Hazy Research explains FlashAttention, an IO-aware exact attention algorithm that accelerates transformer training and inference on long sequences.'
  },
  'ZeRO & DeepSpeed: New system optimizations enable training models with over 100 billion parameters': {
    author: 'Microsoft Research',
    sourceName: 'Microsoft Research Blog',
    publishDate: '2020-02-13',
    readTime: '12 min read',
    tags: ['ZeRO', 'DeepSpeed', 'Distributed Training', 'Model Scaling'],
    excerpt: 'Microsoft Research introduces ZeRO and DeepSpeed optimizations for partitioning optimizer states, gradients, and parameters to train models beyond 100 billion parameters.'
  },
  'Introducing PyTorch Fully Sharded Data Parallel (FSDP) API': {
    author: 'PyTorch',
    sourceName: 'PyTorch Blog',
    publishDate: '2022-03-14',
    readTime: '10 min read',
    tags: ['FSDP', 'PyTorch', 'Distributed Training', 'Sharding'],
    excerpt: 'PyTorch introduces the Fully Sharded Data Parallel API, explaining how parameter, gradient, and optimizer sharding reduce memory pressure for large-model training.'
  },
  'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning': {
    author: 'Stanford Hazy Research',
    sourceName: 'Hazy Research',
    publishDate: '2023-07-17',
    readTime: '14 min read',
    tags: ['FlashAttention-2', 'Attention Kernels', 'GPU Optimization', 'Transformer Training'],
    excerpt: 'Stanford Hazy Research presents FlashAttention-2, improving attention speed through better parallelism, work partitioning, and GPU utilization.'
  },
  'GSPMD: General and Scalable Parallelization for ML Computation Graphs': {
    author: 'Google Research',
    sourceName: 'Google Research Blog',
    publishDate: '2021-08-12',
    readTime: '12 min read',
    tags: ['GSPMD', 'Parallelism', 'Distributed Training', 'Computation Graphs'],
    excerpt: 'Google Research explains GSPMD, a general system for partitioning ML computation graphs across large device meshes for scalable distributed training.'
  },
  'Scaling Language Model Training to a Trillion Parameters Using Megatron': {
    author: 'NVIDIA',
    sourceName: 'NVIDIA Technical Blog',
    publishDate: '2021-04-12',
    readTime: '12 min read',
    tags: ['Megatron', 'Trillion Parameters', 'Distributed Training', 'Model Parallelism'],
    excerpt: 'NVIDIA details Megatron-based strategies for scaling language model training to trillion-parameter regimes with tensor, pipeline, and data parallelism.'
  },
  'Agentic Misalignment in Summer 2026': {
    author: 'Anthropic Fellows, Anthropic, MATS, UK AISI',
    sourceName: 'Anthropic Alignment',
    publishDate: '2026-07-13',
    readTime: '20 min read',
    tags: ['Agentic Misalignment', 'AI Safety', 'Frontier Evals', 'Red Teaming'],
    excerpt: 'Anthropic collaborators study four classes of agentic misalignment across frontier models, using Petri transcripts and controlled simulations to probe hidden failure modes.'
  },
  'Cheating behaviour in frontier model evaluations': {
    author: 'UK AI Security Institute',
    sourceName: 'UK AISI Blog',
    publishDate: '2026-07-21',
    readTime: '12 min read',
    tags: ['Frontier Evals', 'Evaluation Awareness', 'Cyber Safety', 'Monitoring'],
    excerpt: 'UK AISI analyzes cyber-evaluation trajectories with LLM monitors and human review, showing why chain-of-thought and self-report alone are insufficient for detecting evaluation gaming.'
  },
  'How our new Control Red Team is stress-testing frontier monitors': {
    author: 'UK AISI Control Red Team',
    sourceName: 'UK AISI Blog',
    publishDate: '2026-07-23',
    readTime: '12 min read',
    tags: ['Control Red Teaming', 'Frontier Monitors', 'AI Control', 'Safety Evaluation'],
    excerpt: 'UK AISI describes a Control Red Team that stress-tests frontier-lab monitors using adversarial optimization, revealing how monitoring systems can fail under adaptive pressure.'
  },
  'Introducing LinuxArena': {
    author: 'Redwood Research',
    sourceName: 'Redwood Research',
    publishDate: '2026-01-01',
    readTime: '12 min read',
    tags: ['LinuxArena', 'AI Control', 'Security Environments', 'Open Evals'],
    excerpt: 'Redwood Research introduces LinuxArena, an open environment for studying AI control and safety-relevant behavior in Linux-based tasks.'
  },
  'More compute, more capability: Why AI agent evaluations need to account for test-time compute': {
    author: 'UK AI Security Institute',
    sourceName: 'UK AISI Blog',
    publishDate: '2026-07-02',
    readTime: '12 min read',
    tags: ['Test-Time Compute', 'Agent Evaluation', 'Capability Curves', 'Benchmarking'],
    excerpt: 'UK AISI argues that agent evaluations should report capability as a function of test-time compute, showing why single-point scores can hide important scaling behavior.'
  },
  'A pipeline for transcript analysis using Inspect Scout': {
    author: 'UK AISI and Meridian Labs',
    sourceName: 'UK AISI Blog',
    publishDate: '2026-02-25',
    readTime: '12 min read',
    tags: ['Transcript Analysis', 'Inspect Scout', 'Evaluation Tooling', 'Human Review'],
    excerpt: 'UK AISI and Meridian Labs outline a reproducible pipeline for analyzing agent transcripts with scanners, sampling, human validation, and structured failure analysis.'
  },
  'We are Changing our Developer Productivity Experiment Design': {
    author: 'METR',
    sourceName: 'METR Blog',
    publishDate: '2026-02-24',
    readTime: '10 min read',
    tags: ['Experiment Design', 'Developer Productivity', 'AI Impact', 'Randomized Trials'],
    excerpt: 'METR explains why it is changing a developer-productivity experiment design after diagnosing confounding, offering a rare public example of revising AI-impact methodology.'
  },
  'A Field Guide to Rapidly Improving AI Products': {
    author: 'Hamel Husain',
    sourceName: 'Hamel.dev',
    publishDate: '2025-01-01',
    readTime: '18 min read',
    tags: ['AI Product Development', 'Evals', 'Iteration Loops', 'Applied AI'],
    excerpt: 'Hamel Husain gives a field guide for rapidly improving AI products through tight evaluation loops, error analysis, product instrumentation, and focused iteration.'
  },
  'Evaluating the Effectiveness of LLM-Evaluators (aka LLM-as-Judge)': {
    author: 'Eugene Yan',
    sourceName: 'Eugene Yan',
    publishDate: '2024-01-01',
    readTime: '20 min read',
    tags: ['LLM-as-Judge', 'Evaluation', 'Reliability', 'Benchmarking'],
    excerpt: 'Eugene Yan reviews evidence on LLM evaluators, covering where judge models work, where they fail, and how to validate them against human and task-grounded signals.'
  },
  'Introducing the Model Card Toolkit for Easier Model Transparency Reporting': {
    author: 'Google Research',
    sourceName: 'Google Research Blog',
    publishDate: '2020-07-29',
    readTime: '8 min read',
    tags: ['Model Cards', 'Transparency', 'Documentation', 'Responsible AI'],
    excerpt: 'Google Research introduces the Model Card Toolkit for producing standardized transparency reports that document model details, intended use, evaluation, and limitations.'
  },
  'Data-centric ML benchmarking: Announcing DataPerf’s 2023 challenges': {
    author: 'Google Research',
    sourceName: 'Google Research Blog',
    publishDate: '2023-03-07',
    readTime: '10 min read',
    tags: ['DataPerf', 'Data-Centric AI', 'Benchmarking', 'Datasets'],
    excerpt: 'Google Research announces DataPerf challenges for benchmarking data-centric ML, shifting attention from fixed datasets to data selection, cleaning, and curation quality.'
  },
  'J-Space: Yet Another LLM Mind Reader?': {
    author: 'David Louapre',
    sourceName: 'Hugging Face Blog',
    publishDate: '2026-07-13',
    readTime: '14 min read',
    tags: ['J-Space', 'Model Internals', 'LLM Interpretation', 'Community Research'],
    excerpt: 'David Louapre explores J-Space as a community investigation of language-model internals, probing whether hidden representations can reveal model beliefs or future tokens.'
  },
  'Introducing Gemini 3.5 Flash Cyber': {
    author: 'Google DeepMind',
    sourceName: 'Google DeepMind Blog',
    publishDate: '2026-01-01',
    readTime: '8 min read',
    tags: ['Gemini', 'Cybersecurity', 'Frontier Models', 'Specialized Models'],
    excerpt: 'Google DeepMind introduces Gemini 3.5 Flash Cyber, a specialized frontier model variant aimed at cybersecurity workflows and cyber-reasoning assistance.'
  },
  'How to Do Great Research': {
    author: 'Nick Feamster and Alex Gray',
    sourceName: 'Noise Lab',
    publishDate: '2010-01-01',
    readTime: '40 min read',
    tags: ['Research Training', 'Graduate School', 'Project Design', 'Research Process'],
    excerpt: 'Nick Feamster and Alex Gray provide a full research-course guide covering idea generation, critique, mini-projects, reading, writing, and turning early projects into publishable work.'
  },
  'How to do Research At the MIT AI Lab': {
    author: 'David Chapman',
    sourceName: 'MIT AI Lab',
    publishDate: '1988-09-01',
    readTime: '35 min read',
    tags: ['Research Advice', 'AI Lab Culture', 'Writing', 'Graduate Research'],
    excerpt: 'David Chapman compiles classic MIT AI Lab advice on reading, writing, programming, choosing research problems, working with advisors, and navigating the emotional realities of research.'
  },
  'Research as a Stochastic Decision Process': {
    author: 'Jacob Steinhardt',
    sourceName: 'Jacob Steinhardt',
    publishDate: '2018-01-01',
    readTime: '16 min read',
    tags: ['Research Strategy', 'Decision Making', 'Uncertainty', 'Research Process'],
    excerpt: 'Jacob Steinhardt frames research as a stochastic decision process, offering a practical lens for choosing projects, gathering information, and making progress under uncertainty.'
  },
  'Film Study for Research': {
    author: 'Jacob Steinhardt',
    sourceName: 'Jacob Steinhardt',
    publishDate: '2021-01-01',
    readTime: '12 min read',
    tags: ['Research Training', 'Deliberate Practice', 'Paper Reading', 'Scientific Taste'],
    excerpt: 'Jacob Steinhardt adapts the idea of film study to research training, using careful review of papers, talks, and decisions to develop scientific taste and technique.'
  },
  'Replication Issues in AI Research': {
    author: 'Denny Britz',
    sourceName: 'Denny Britz',
    publishDate: '2020-01-01',
    readTime: '12 min read',
    tags: ['Replication', 'AI Research', 'Reproducibility', 'Experimental Practice'],
    excerpt: 'Denny Britz reflects on replication issues in AI research, highlighting hidden implementation details, compute constraints, weak baselines, and incentives that make results hard to reproduce.'
  },
  'You and Your Research': {
    author: 'Richard Hamming',
    sourceName: 'Richard Hamming',
    publishDate: '1986-03-07',
    readTime: '30 min read',
    tags: ['Research Advice', 'Scientific Career', 'Taste', 'Impact'],
    excerpt: 'Richard Hamming gives a classic lecture on choosing important problems, cultivating taste, using time deliberately, and building a research career around consequential work.'
  },
  'Principles of Effective Research': {
    author: 'Michael Nielsen',
    sourceName: 'Michael Nielsen',
    publishDate: '2004-01-01',
    readTime: '18 min read',
    tags: ['Research Practice', 'Creativity', 'Scientific Work', 'Learning'],
    excerpt: 'Michael Nielsen distills principles for effective research, emphasizing problem selection, creative routines, collaboration, communication, and compounding scientific skill.'
  },
  'Becoming an AI Researcher: Practical Advice for Graduate Students': {
    author: 'Stefano V. Albrecht',
    sourceName: 'PhD in AI',
    publishDate: '2026-01-01',
    readTime: '18 min read',
    tags: ['AI Research', 'Graduate School', 'Career Advice', 'Research Practice'],
    excerpt: 'Stefano V. Albrecht gives practical advice for becoming an AI researcher, covering graduate-school strategy, research skills, reading, writing, collaboration, and career planning.'
  },
  'How to Read a Paper': {
    author: 'S. Keshav',
    sourceName: 'University of Cambridge',
    publishDate: '2007-01-01',
    readTime: '8 min read',
    tags: ['Paper Reading', 'Research Skills', 'Literature Review', 'Scientific Method'],
    excerpt: 'S. Keshav presents the three-pass method for reading papers, giving a durable workflow for triaging, understanding, and critically evaluating technical literature.'
  },
  'How to Write a Great Research Paper': {
    author: 'Simon Peyton Jones',
    sourceName: 'Microsoft Research',
    publishDate: '2016-01-01',
    readTime: '8 min read',
    tags: ['Paper Writing', 'Research Communication', 'Scientific Writing', 'Talks'],
    excerpt: 'Simon Peyton Jones explains how to write a strong research paper by foregrounding ideas, structuring the argument, motivating the problem, and making the contribution legible.'
  }
};

const escapeJsString = (value) => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'")
  .replace(/\r?\n/g, ' ');

const escapeSqlString = (value) => String(value ?? '').replace(/'/g, "''");

const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const slugify = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 74);

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const inferAuthor = (tail) => {
  const beforeDate = String(tail || '').split(/ · \d{4}/)[0];
  return beforeDate
    .replace(/\*\*/g, '')
    .replace(/`[^`]+`/g, '')
    .split('。')[0]
    .trim();
};

const inferDate = (tail) => {
  const exact = String(tail || '').match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (exact) return exact[1];
  const month = String(tail || '').match(/\b(\d{4}-\d{2})\b/);
  if (month) return `${month[1]}-01`;
  const year = String(tail || '').match(/\b(19\d{2}|20\d{2})\b/);
  if (year) return `${year[1]}-01-01`;
  return '2026-01-01';
};

const inferSourceName = (url, author) => {
  const domain = getDomain(url);
  if (domain.includes('huggingface.co')) return 'Hugging Face Blog';
  if (domain.includes('allenai.org')) return 'Ai2 Blog';
  if (domain.includes('hazyresearch.stanford.edu')) return 'Hazy Research';
  if (domain.includes('jalammar.github.io')) return 'Jay Alammar';
  if (domain.includes('sander.ai')) return 'Sander Dieleman';
  if (domain.includes('yang-song.net')) return 'Yang Song';
  if (domain.includes('research.google')) return 'Google Research Blog';
  if (domain.includes('ai.meta.com')) return 'Meta AI Blog';
  if (domain.includes('anthropic.com')) return 'Anthropic';
  if (domain.includes('vllm.ai')) return 'vLLM Blog';
  if (domain.includes('modal.com')) return domain.includes('/docs/') ? 'Modal Docs' : 'Modal Blog';
  if (domain.includes('pytorch.org')) return 'PyTorch Blog';
  if (domain.includes('developer.nvidia.com')) return 'NVIDIA Technical Blog';
  if (domain.includes('microsoft.com')) return 'Microsoft Research';
  if (domain.includes('aisi.gov.uk')) return 'UK AISI Blog';
  if (domain.includes('redwoodresearch.org')) return 'Redwood Research';
  if (domain.includes('metr.org')) return 'METR Blog';
  if (domain.includes('hamel.dev')) return 'Hamel.dev';
  if (domain.includes('eugeneyan.com')) return 'Eugene Yan';
  if (domain.includes('deepmind.google')) return 'Google DeepMind Blog';
  return author || domain;
};

const fallbackTags = (category, title) => {
  const lower = title.toLowerCase();
  if (lower.includes('diffusion') || lower.includes('generative')) return ['Generative Models', 'Diffusion Models', 'Model Analysis', category];
  if (lower.includes('inference') || lower.includes('kernel') || lower.includes('flash')) return ['LLM Inference', 'Kernels', 'Performance', 'Systems'];
  if (lower.includes('eval') || lower.includes('benchmark')) return ['Evaluation', 'Benchmarking', 'Measurement', category];
  if (lower.includes('research') || lower.includes('paper')) return ['Research Practice', 'Scientific Writing', 'Research Skills', category];
  if (lower.includes('robot') || lower.includes('motion')) return ['Robotics', 'Embodied AI', 'World Models', category];
  return [category, 'AI Research', 'Technical Blog', 'A+ Selection'];
};

const genericExcerpt = (title, author, category) => (
  `${author} explains ${title}, a technically valuable ${category.toLowerCase()} article selected from the BlogrXiv A+ review list for its durable research insight and practical detail.`
);

const getLines = (text) => {
  const rows = [];
  let category = '';

  for (const line of text.split(/\n/)) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) category = heading[1].trim();

    const match = line.match(/^[-*]\s+\[ \]\s+\*\*A\+\*\*\s+·\s+\[([^\]]+)\]\(([^)]+)\)\s+—\s+(.+)$/);
    if (!match) continue;
    if (!categories.has(category)) {
      throw new Error(`Unsupported category "${category}" for ${match[1]}`);
    }

    rows.push({
      category,
      title: match[1],
      url: match[2],
      tail: match[3]
    });
  }

  return rows;
};

const wrapSvgText = (text, maxChars, maxLines) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
};

const coverSvg = (blog) => {
  const [bg, soft, accent, ink] = categoryPalettes[blog.category] || categoryPalettes['Research Craft'];
  const titleLines = wrapSvgText(blog.title, 34, 3);
  const sourceLines = wrapSvgText(blog.sourceName, 28, 1);
  const titleTspans = titleLines.map((line, index) =>
    `<tspan x="116" dy="${index === 0 ? 0 : 68}">${escapeXml(line)}</tspan>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(blog.title)} cover</title>
  <desc id="desc">Editorial BlogrXiv cover for an A+ ${escapeXml(blog.category)} selection.</desc>
  <rect width="1200" height="630" fill="${bg}"/>
  <rect x="72" y="70" width="1056" height="490" rx="30" fill="#ffffff" stroke="${accent}" stroke-width="4"/>
  <rect x="96" y="94" width="1008" height="116" rx="22" fill="${soft}"/>
  <text x="116" y="166" fill="${ink}" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700">A+ ${escapeXml(blog.category)}</text>
  <path d="M116 265h220M116 309h148M116 353h290" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity="0.85"/>
  <circle cx="886" cy="338" r="116" fill="${soft}" stroke="${accent}" stroke-width="8"/>
  <path d="M832 338h108M886 284v108" stroke="${accent}" stroke-width="18" stroke-linecap="round"/>
  <text x="116" y="438" fill="${ink}" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800">${titleTspans}</text>
  <text x="116" y="522" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">${escapeXml(sourceLines[0] || blog.author)}</text>
</svg>
`;
};

const blogObject = (blog) => [
  '            {',
  `                id: '${escapeJsString(blog.id)}',`,
  `                title: '${escapeJsString(blog.title)}',`,
  `                excerpt: '${escapeJsString(blog.excerpt)}',`,
  `                author: '${escapeJsString(blog.author)}',`,
  `                authorAvatar: '${escapeJsString(blog.authorAvatar)}',`,
  `                category: '${escapeJsString(blog.category)}',`,
  `                tags: [${blog.tags.map(tag => `'${escapeJsString(tag)}'`).join(', ')}],`,
  `                readTime: '${escapeJsString(blog.readTime)}',`,
  `                publishDate: '${escapeJsString(blog.publishDate)}',`,
  `                sourceName: '${escapeJsString(blog.sourceName)}',`,
  `                url: '${escapeJsString(blog.url)}',`,
  `                coverImage: '${escapeJsString(blog.coverImage)}',`,
  `                coverAlt: '${escapeJsString(blog.coverAlt)}',`,
  `                coverFit: '${escapeJsString(blog.coverFit)}'`,
  '            }'
].join('\n');

const sqlArray = (values) => `array[${values.map(value => `'${escapeSqlString(value)}'`).join(', ')}]`;

const sqlTuple = (blog) => `(
  '${escapeSqlString(blog.id)}',
  '${escapeSqlString(blog.title)}',
  '${escapeSqlString(blog.excerpt)}',
  '${escapeSqlString(blog.author)}',
  '${escapeSqlString(blog.authorAvatar)}',
  '${escapeSqlString(blog.category)}',
  ${sqlArray(blog.tags)},
  '${escapeSqlString(blog.readTime)}',
  '${escapeSqlString(blog.publishDate)}',
  '${escapeSqlString(blog.sourceName)}',
  '${escapeSqlString(blog.url)}',
  '${escapeSqlString(blog.coverImage)}',
  '${escapeSqlString(blog.coverAlt)}',
  '${escapeSqlString(blog.coverFit)}',
  'published',
  false
)`;

const blogMd = await readFile(blogMdPath, 'utf8');
const appSource = await readFile(appPath, 'utf8');
const rows = getLines(blogMd);

const usedIds = new Set([...appSource.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(match => match[1]));
const usedUrls = new Set([...appSource.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map(match => match[1]));
const blogs = [];

for (const row of rows) {
  if (usedUrls.has(row.url)) continue;
  const metadata = explicitMetadata[row.title] || {};
  const author = metadata.author || inferAuthor(row.tail);
  const sourceName = metadata.sourceName || inferSourceName(row.url, author);
  const idBase = slugify(`${sourceName} ${row.title}`);
  let id = idBase;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${idBase}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);

  const coverSlug = slugify(row.title);
  const coverImage = `assets/img/covers/a-plus/${coverSlug}.svg`;
  blogs.push({
    id,
    title: row.title,
    excerpt: metadata.excerpt || genericExcerpt(row.title, author, row.category),
    author,
    authorAvatar: metadata.authorAvatar || `https://www.google.com/s2/favicons?domain=${getDomain(row.url)}&sz=128`,
    category: row.category,
    tags: metadata.tags || fallbackTags(row.category, row.title),
    readTime: metadata.readTime || '12 min read',
    publishDate: metadata.publishDate || inferDate(row.tail),
    sourceName,
    url: row.url,
    coverImage,
    coverAlt: `${row.title} A+ BlogrXiv cover`,
    coverFit: 'cover'
  });
}

await mkdir(coverDir, { recursive: true });
await Promise.all(blogs.map(async (blog) => {
  const coverName = path.basename(blog.coverImage);
  await writeFile(path.join(coverDir, coverName), coverSvg(blog), 'utf8');
}));

let updatedApp = appSource;
if (blogs.length) {
  const marker = /(\n\s+getRecentCommunityBlogAdditions\(\)\s*\{\s*\n\s+return\s+\[\s*\n)/;
  const match = updatedApp.match(marker);
  if (!match || typeof match.index !== 'number') {
    throw new Error('Could not find getRecentCommunityBlogAdditions() insertion point');
  }
  const block = blogs.map(blogObject).join(',\n') + ',\n';
  updatedApp = `${updatedApp.slice(0, match.index + match[0].length)}${block}${updatedApp.slice(match.index + match[0].length)}`;
  await writeFile(appPath, updatedApp, 'utf8');
}

if (blogs.length === 0) {
  console.log(JSON.stringify({
    extracted: rows.length,
    inserted: 0,
    skippedExistingUrls: rows.length,
    coverDir: path.relative(repoRoot, coverDir),
    upsertPath: path.relative(repoRoot, upsertPath),
    note: 'No new A+ URLs found; existing app.js and upsert SQL were left unchanged.'
  }, null, 2));
  process.exit(0);
}

const sql = `-- Upsert BlogrXiv A+ selections extracted from blog.md.
-- Generated by scripts/import_a_plus_blogs.mjs.

insert into public.blogs (
  id,
  title,
  excerpt,
  author,
  author_avatar,
  category,
  tags,
  read_time,
  publish_date,
  source_name,
  url,
  cover_image,
  cover_alt,
  cover_fit,
  status,
  featured
) values
${blogs.map(sqlTuple).join(',\n')}
on conflict (id) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  author = excluded.author,
  author_avatar = excluded.author_avatar,
  category = excluded.category,
  tags = excluded.tags,
  read_time = excluded.read_time,
  publish_date = excluded.publish_date,
  source_name = excluded.source_name,
  url = excluded.url,
  cover_image = excluded.cover_image,
  cover_alt = excluded.cover_alt,
  cover_fit = excluded.cover_fit,
  status = excluded.status,
  featured = excluded.featured;

select id, title, category, publish_date, status
from public.blogs
where id in (
${blogs.map(blog => `  '${escapeSqlString(blog.id)}'`).join(',\n')}
)
order by publish_date desc, id asc;
`;

await writeFile(upsertPath, sql, 'utf8');

console.log(JSON.stringify({
  extracted: rows.length,
  inserted: blogs.length,
  skippedExistingUrls: rows.length - blogs.length,
  coverDir: path.relative(repoRoot, coverDir),
  upsertPath: path.relative(repoRoot, upsertPath)
}, null, 2));
