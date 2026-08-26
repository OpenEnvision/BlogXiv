// Curated Bloggers Page JavaScript
class BloggersPage {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.bloggers = [];
        this.filteredBloggers = [];
        this.searchQuery = '';
        this.currentFilters = {
            specialty: 'all',
            sort: 'impact'
        };

        this.profiles = [
            {
                name: 'Sebastian Raschka',
                institution: 'Lightning AI / University of Wisconsin-Madison',
                homepage: 'https://sebastianraschka.com/',
                avatar: 'https://sebastianraschka.com/images/logos/photo-2021-08-25_compressed.jpg',
                matches: ['Sebastian Raschka', 'Ahead of AI'],
                specialty: 'LLM & MLLM',
                focus: ['LLM architecture', 'evaluation', 'coding agents'],
                qualityRank: 12
            },
            {
                name: 'Nathan Lambert',
                institution: 'Ai2 / Interconnects',
                homepage: 'https://www.interconnects.ai/',
                avatar: 'https://github.com/natolambert.png',
                matches: ['Nathan Lambert', 'Interconnects'],
                specialty: 'Foundation Model',
                focus: ['open models', 'RLHF', 'reasoning models'],
                qualityRank: 11
            },
            {
                name: 'Lilian Weng',
                institution: "Lil'Log / former OpenAI",
                homepage: 'https://lilianweng.github.io/',
                avatar: 'https://github.com/lilianweng.png',
                matches: ['Lilian Weng', "Lil'Log"],
                specialty: 'Trustworthy AI',
                focus: ['AI safety', 'human data', 'generative models'],
                qualityRank: 11
            },
            {
                name: 'Andrej Karpathy',
                institution: 'Eureka Labs / former OpenAI and Tesla',
                homepage: 'https://karpathy.ai/',
                avatar: 'https://karpathy.ai/assets/me_new.jpg',
                matches: ['Karpathy', 'Andrej Karpathy'],
                specialty: 'Foundation Model',
                focus: ['deep learning systems', 'training practice', 'AI education'],
                qualityRank: 10
            },
            {
                name: 'Chris Olah',
                institution: 'Anthropic / Transformer Circuits',
                homepage: 'https://colah.github.io/',
                avatar: 'https://github.com/colah.png',
                matches: ['Chris Olah', "colah's blog", 'Transformer Circuits'],
                specialty: 'Trustworthy AI',
                focus: ['mechanistic interpretability', 'visual explanations', 'transformer circuits'],
                qualityRank: 10
            },
            {
                name: 'François Chollet',
                institution: 'Ndea / ARC Prize / Keras',
                homepage: 'https://fchollet.com/',
                avatar: 'https://github.com/fchollet.png',
                matches: ['François Chollet', 'Francois Chollet', 'Sparks in the Wind', 'Keras Blog'],
                specialty: 'Foundation Model',
                focus: ['abstraction', 'generalization', 'LLM mental models'],
                qualityRank: 9
            },
            {
                name: 'Yao Fu',
                institution: 'Long-context and multimodal reasoning researcher',
                homepage: 'https://yaofu.notion.site/About-Yao-Fu-b5efd2e00ea94bd3a18ca1ae78e655f8',
                avatar: 'https://github.com/FranxYao.png',
                matches: ['Yao Fu'],
                specialty: 'LLM & MLLM',
                focus: ['long context', 'reasoning', 'instruction tuning'],
                qualityRank: 8
            },
            {
                name: 'David Ha',
                institution: 'hardmaru / former Google Brain',
                homepage: 'https://otoro.net/',
                avatar: 'https://github.com/hardmaru.png',
                matches: ['David Ha', 'hardmaru', 'otoro'],
                specialty: 'World Model',
                focus: ['world models', 'neuroevolution', 'generative agents'],
                qualityRank: 8
            },
            {
                name: 'Sara Hooker',
                institution: 'Adaption Labs / former Cohere For AI',
                homepage: 'https://hardwarelottery.github.io/',
                avatar: 'https://www.google.com/s2/favicons?domain=hardwarelottery.github.io&sz=128',
                matches: ['Sara Hooker', 'The Hardware Lottery'],
                specialty: 'Efficient AI',
                focus: ['hardware-aware AI', 'research incentives', 'efficient models'],
                qualityRank: 8
            },
            {
                name: 'Sergey Levine',
                institution: 'UC Berkeley / BAIR',
                homepage: 'https://people.eecs.berkeley.edu/~svlevine/',
                avatar: 'https://www.google.com/s2/favicons?domain=berkeley.edu&sz=128',
                matches: ['Sergey Levine'],
                specialty: 'AI Agents',
                focus: ['offline RL', 'robot learning', 'decision making'],
                qualityRank: 8
            },
            {
                name: 'Patrick Mineault',
                institution: 'xcorr / NeuroAI archive',
                homepage: 'https://xcorr.net/',
                avatar: 'https://www.google.com/s2/favicons?domain=xcorr.net&sz=128',
                matches: ['Patrick Mineault', 'Good Research Code', 'xcorr'],
                specialty: 'Research Craft',
                focus: ['research code', 'neuroAI', 'scientific workflow'],
                qualityRank: 8
            },
            {
                name: 'Elvis Saravia',
                institution: 'DAIR.AI',
                homepage: 'https://www.dair.ai/blog',
                avatar: 'https://www.google.com/s2/favicons?domain=dair.ai&sz=128',
                matches: ['Elvis Saravia', 'DAIR.AI'],
                specialty: 'AI Agents',
                focus: ['prompt engineering', 'context engineering', 'agent workflows'],
                qualityRank: 7
            },
            {
                name: 'Hamel Husain',
                institution: "Hamel's Blog / Parlance Labs",
                homepage: 'https://hamel.dev/',
                avatar: 'https://hamel.dev/hamel_transparent.png',
                matches: ['Hamel Husain', "Hamel's Blog"],
                specialty: 'Research Craft',
                focus: ['LLM evals', 'product reliability', 'AI engineering'],
                qualityRank: 10
            },
            {
                name: 'Simon Willison',
                institution: 'Datasette / Independent',
                homepage: 'https://simonwillison.net/',
                avatar: 'https://github.com/simonw.png',
                matches: ['Simon Willison'],
                specialty: 'LLM & MLLM',
                focus: ['LLM tooling', 'agents', 'security'],
                qualityRank: 10
            },
            {
                name: 'Eugene Yan',
                institution: 'Amazon / Applied ML Systems',
                homepage: 'https://eugeneyan.com/',
                avatar: 'https://github.com/eugeneyan.png',
                matches: ['Eugene Yan', 'Applied LLMs'],
                specialty: 'Research Craft',
                focus: ['evaluation practice', 'recommendation systems', 'LLM product lessons'],
                qualityRank: 9
            },
            {
                name: 'Su Jianlin',
                institution: 'Scientific Spaces / BoJone',
                homepage: 'https://www.spaces.ac.cn/',
                avatar: 'https://kexue.fm/usr/themes/geekg/images/avatar.png',
                matches: ['苏剑林', '科学空间'],
                specialty: 'Efficient AI',
                focus: ['optimization', 'diffusion theory', 'sequence modeling'],
                qualityRank: 9
            },
            {
                name: 'Tri Dao',
                institution: 'Princeton / Dao AI Lab',
                homepage: 'https://tridao.me/',
                avatar: 'https://tridao.me/assets/img/tri_photo_2021_04.jpeg?v=70239a90f4a7b7f7fce95223cab772a2',
                matches: ['Tri Dao', 'Dao AI Lab'],
                specialty: 'Efficient AI',
                focus: ['FlashAttention', 'hardware-aware algorithms', 'efficient training'],
                qualityRank: 9
            },
            {
                name: 'Jay Alammar',
                institution: 'Cohere / Visual ML Explanations',
                homepage: 'https://jalammar.github.io/',
                avatar: 'https://github.com/jalammar.png',
                matches: ['Jay Alammar', 'Language Models & Co.'],
                specialty: 'LLM & MLLM',
                focus: ['visual explainers', 'reasoning models', 'diffusion'],
                qualityRank: 8
            },
            {
                name: 'Sander Dieleman',
                institution: 'Google DeepMind',
                homepage: 'https://sander.ai/',
                avatar: 'https://sander.ai/images/avatar.jpg',
                matches: ['Sander Dieleman', 'Sander AI'],
                specialty: 'Visual Generation',
                focus: ['diffusion', 'flow maps', 'generative modeling'],
                qualityRank: 8
            },
            {
                name: 'Jeremy Bernstein',
                institution: 'Thinking Machines Lab',
                homepage: 'https://jeremybernste.in/',
                avatar: 'https://jeremybernste.in/images/pages/me.jpg',
                matches: ['Jeremy Bernstein'],
                specialty: 'Efficient AI',
                focus: ['optimization', 'Muon', 'training dynamics'],
                qualityRank: 7
            },
            {
                name: 'OpenAI',
                institution: 'OpenAI Research & Safety Blog',
                homepage: 'https://openai.com/news/',
                avatar: 'https://github.com/openai.png',
                matches: ['OpenAI'],
                specialty: 'Foundation Model',
                focus: ['frontier model releases', 'safety systems', 'deployment lessons'],
                qualityRank: 10
            },
            {
                name: 'Anthropic',
                institution: 'Anthropic Research, Engineering & Alignment',
                homepage: 'https://www.anthropic.com/research',
                avatar: 'https://github.com/anthropics.png',
                matches: ['Anthropic'],
                specialty: 'Trustworthy AI',
                focus: ['alignment science', 'interpretability', 'agentic engineering'],
                qualityRank: 10
            },
            {
                name: 'Google DeepMind',
                institution: 'Google DeepMind Blog',
                homepage: 'https://deepmind.google/discover/blog/',
                avatar: 'https://github.com/google-deepmind.png',
                matches: ['Google DeepMind', 'DeepMind'],
                specialty: 'Frontier',
                focus: ['frontier safety', 'science of AI', 'multimodal agents'],
                qualityRank: 10
            },
            {
                name: 'Meta AI (FAIR)',
                institution: 'Meta AI / Fundamental AI Research',
                homepage: 'https://ai.meta.com/blog/',
                avatar: 'https://github.com/facebookresearch.png',
                matches: ['Meta AI', 'Meta FAIR', 'Meta Superintelligence Labs'],
                specialty: 'World Model',
                focus: ['world models', 'open-weight releases', 'perception research'],
                qualityRank: 9
            },
            {
                name: 'NVIDIA',
                institution: 'NVIDIA Technical Blog & Research',
                homepage: 'https://developer.nvidia.com/blog/',
                avatar: 'https://github.com/NVIDIA.png',
                matches: ['NVIDIA'],
                specialty: 'Efficient AI',
                focus: ['inference optimization', 'physical AI', 'GPU systems'],
                qualityRank: 9
            },
            {
                name: 'Google Research',
                institution: 'Google Research Blog',
                homepage: 'https://research.google/blog/',
                avatar: 'https://github.com/google-research.png',
                matches: ['Google Research'],
                specialty: 'Research Craft',
                focus: ['research methodology', 'scaling studies', 'applied ML'],
                qualityRank: 8
            },
            {
                name: 'Microsoft Research',
                institution: 'Microsoft Research Blog',
                homepage: 'https://www.microsoft.com/en-us/research/blog/',
                avatar: 'https://github.com/microsoft.png',
                matches: ['Microsoft Research'],
                specialty: 'AI Agents',
                focus: ['agent frameworks', 'small language models', 'systems research'],
                qualityRank: 8
            },
            {
                name: 'Stanford HAI',
                institution: 'Stanford Institute for Human-Centered AI',
                homepage: 'https://hai.stanford.edu/news',
                avatar: 'https://www.google.com/s2/favicons?domain=hai.stanford.edu&sz=128',
                matches: ['Stanford HAI'],
                specialty: 'Frontier',
                focus: ['AI Index', 'policy analysis', 'human-centered AI'],
                qualityRank: 8
            },
            {
                name: 'MiniMax',
                institution: 'MiniMax Research Blog',
                homepage: 'https://www.minimax.io/news',
                avatar: 'https://www.google.com/s2/favicons?domain=minimax.io&sz=128',
                matches: ['MiniMax'],
                specialty: 'LLM & MLLM',
                focus: ['lightning attention', 'agentic models', 'multimodal generation'],
                qualityRank: 7
            },
            {
                name: 'ByteDance Seed',
                institution: 'ByteDance Seed Research',
                homepage: 'https://seed.bytedance.com/',
                avatar: 'https://www.google.com/s2/favicons?domain=seed.bytedance.com&sz=128',
                matches: ['ByteDance Seed'],
                specialty: 'Multimodal Model',
                focus: ['unified multimodal models', 'vision-language', 'video generation'],
                qualityRank: 7
            },
            {
                name: 'Apple Machine Learning Research',
                institution: 'Apple ML Research Blog',
                homepage: 'https://machinelearning.apple.com/',
                avatar: 'https://github.com/apple.png',
                matches: ['Apple Machine Learning Research', 'Apple ML Research'],
                specialty: 'Multimodal Model',
                focus: ['on-device models', 'MLLM training recipes', 'efficiency'],
                qualityRank: 7
            },
            {
                name: 'Tencent Hunyuan',
                institution: 'Tencent Hunyuan Lab',
                homepage: 'https://hunyuan.tencent.com/',
                avatar: 'https://www.google.com/s2/favicons?domain=hunyuan.tencent.com&sz=128',
                matches: ['Tencent Hunyuan', 'Hunyuan'],
                specialty: 'Visual Generation',
                focus: ['video generation', '3D asset generation', 'open-source releases'],
                qualityRank: 7
            },
            {
                name: 'Black Forest Labs',
                institution: 'Black Forest Labs / FLUX',
                homepage: 'https://bfl.ai/',
                avatar: 'https://github.com/black-forest-labs.png',
                matches: ['Black Forest Labs'],
                specialty: 'Visual Generation',
                focus: ['FLUX models', 'image editing', 'latent flow matching'],
                qualityRank: 7
            },
            {
                name: 'Runway',
                institution: 'Runway Research',
                homepage: 'https://runwayml.com/research',
                avatar: 'https://github.com/runwayml.png',
                matches: ['Runway'],
                specialty: 'Visual Generation',
                focus: ['video generation', 'general world models', 'creative tooling'],
                qualityRank: 7
            },
            {
                name: 'Yang Song',
                institution: 'OpenAI / Caltech (former)',
                homepage: 'https://yang-song.net/',
                avatar: 'https://github.com/yang-song.png',
                matches: ['Yang Song'],
                specialty: 'Visual Generation',
                focus: ['score-based modeling', 'diffusion', 'generative modeling theory'],
                qualityRank: 9
            },
            {
                name: 'Victoria Krakovna',
                institution: 'Google DeepMind',
                homepage: 'https://vkrakovna.wordpress.com/',
                avatar: 'https://www.google.com/s2/favicons?domain=deepmind.google&sz=128',
                matches: ['Victoria Krakovna'],
                specialty: 'Trustworthy AI',
                focus: ['specification gaming', 'reward hacking', 'AI safety taxonomy'],
                qualityRank: 9
            },
            {
                name: 'Jacob Steinhardt',
                institution: 'UC Berkeley',
                homepage: 'https://www.stanford.edu/~jsteinhardt/',
                avatar: 'https://www.google.com/s2/favicons?domain=berkeley.edu&sz=128',
                matches: ['Jacob Steinhardt'],
                specialty: 'How to Research',
                focus: ['research strategy', 'advising', 'robust ML'],
                qualityRank: 9
            },
            {
                name: 'Denny Britz',
                institution: 'Independent / formerly Google Brain',
                homepage: 'https://dennybritz.com/',
                avatar: 'https://github.com/dennybritz.png',
                matches: ['Denny Britz'],
                specialty: 'Research Craft',
                focus: ['replication', 'RL research', 'paper reading'],
                qualityRank: 8
            },
            {
                name: 'Asankhaya Sharma',
                institution: 'Hugging Face / CodeLion',
                homepage: 'https://huggingface.co/codelion',
                avatar: 'https://github.com/codelion.png',
                matches: ['Asankhaya Sharma', 'CodeLion'],
                specialty: 'Foundation Model',
                focus: ['pretraining mix', 'data curation', 'small-scale scaling laws'],
                qualityRank: 8
            },
            {
                name: 'David Louapre',
                institution: 'Science Etonnante / Hugging Face community',
                homepage: 'https://huggingface.co/dlouapre',
                avatar: 'https://github.com/dlouapre.png',
                matches: ['David Louapre'],
                specialty: 'Trustworthy AI',
                focus: ['model internals', 'interpretability', 'community research'],
                qualityRank: 7
            },
            {
                name: 'Charles Frye',
                institution: 'Modal',
                homepage: 'https://modal.com/',
                avatar: 'https://www.google.com/s2/favicons?domain=modal.com&sz=128',
                matches: ['Charles Frye'],
                specialty: 'Efficient AI',
                focus: ['LLM serving', 'speculative decoding', 'production inference'],
                qualityRank: 8
            },
            {
                name: 'Lei Mao',
                institution: 'Independent systems engineer',
                homepage: 'https://leimao.github.io/',
                avatar: 'https://github.com/leimao.png',
                matches: ['Lei Mao'],
                specialty: 'Efficient AI',
                focus: ['systems profiling', 'batching', 'GPU optimization'],
                qualityRank: 7
            },
            {
                name: 'Nick Feamster',
                institution: 'University of Chicago',
                homepage: 'https://noise-lab.net/',
                avatar: 'https://www.google.com/s2/favicons?domain=noise-lab.net&sz=128',
                matches: ['Nick Feamster'],
                specialty: 'How to Research',
                focus: ['research methodology', 'PhD training', 'scientific writing'],                qualityRank: 8
            },
            {
                name: 'Stefano V. Albrecht',
                institution: 'University of Edinburgh / phd-in-ai.com',
                homepage: 'https://www.phd-in-ai.com/',
                avatar: 'https://www.google.com/s2/favicons?domain=phd-in-ai.com&sz=128',
                matches: ['Stefano V. Albrecht', 'Stefano Albrecht'],
                specialty: 'How to Research',
                focus: ['graduate advising', 'AI research careers', 'lab culture'],
                qualityRank: 8
            },
            {
                name: 'Simon Peyton Jones',
                institution: 'Microsoft Research',
                homepage: 'https://www.microsoft.com/en-us/research/people/simonpj/',
                avatar: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
                matches: ['Simon Peyton Jones'],
                specialty: 'How to Research',
                focus: ['paper writing', 'research talks', 'academic communication'],
                qualityRank: 9
            },
            {
                name: 'Terence Tao',
                institution: 'UCLA / What\'s new',
                homepage: 'https://terrytao.wordpress.com/',
                avatar: 'https://www.google.com/s2/favicons?domain=terrytao.wordpress.com&sz=128',
                matches: ['Terence Tao'],
                specialty: 'How to Research',
                focus: ['research taste', 'problem solving', 'mathematical research practice'],
                qualityRank: 9
            },
            {
                name: 'Michael Nielsen',
                institution: 'Independent / quantum computing historian',
                homepage: 'https://michaelnielsen.org/',
                avatar: 'https://www.google.com/s2/favicons?domain=michaelnielsen.org&sz=128',
                matches: ['Michael Nielsen'],
                specialty: 'How to Research',
                focus: ['effective research', 'open science', 'scientific communication'],
                qualityRank: 8
            },
            {
                name: 'John Schulman',
                institution: 'Thinking Machines Lab / former OpenAI',
                homepage: 'http://joschu.net/blog/',
                avatar: 'https://www.google.com/s2/favicons?domain=joschu.net&sz=128',
                matches: ['John Schulman', 'joschu.net'],
                specialty: 'How to Research',
                focus: ['ML research methodology', 'reproducibility', 'research taste'],
                qualityRank: 8
            },
            {
                name: 'Gian Segato',
                institution: 'Anthropic Engineering',
                homepage: 'https://www.anthropic.com/engineering',
                avatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                matches: ['Gian Segato'],
                specialty: 'AI Agents',
                focus: ['agent evaluations', 'infrastructure noise', 'coding agents'],
                qualityRank: 8
            },
            {
                name: 'Colin Raffel',
                institution: 'Hugging Face / UNC Chapel Hill',
                homepage: 'https://colinraffel.com/',
                avatar: 'https://github.com/colinraffel.png',
                matches: ['Colin Raffel'],
                specialty: 'Frontier',
                focus: ['scaling outlook', 'open models', 'research commentary'],
                qualityRank: 7
            },
            {
                name: 'Jason Wei',
                institution: 'OpenAI / former Google Brain',
                homepage: 'https://www.jasonwei.net/',
                avatar: 'https://www.google.com/s2/favicons?domain=jasonwei.net&sz=128',
                matches: ['Jason Wei'],
                specialty: 'How to Research',
                focus: ['AI research practice', 'chain-of-thought', 'reasoning models'],
                qualityRank: 8
            },
            {
                name: 'Matt Might',
                institution: 'University of Alabama at Birmingham',
                homepage: 'https://matt.might.net/',
                avatar: 'https://www.google.com/s2/favicons?domain=matt.might.net&sz=128',
                matches: ['Matt Might'],
                specialty: 'How to Research',
                focus: ['PhD guidance', 'research visualization', 'academic careers'],
                qualityRank: 8
            },
            {
                name: 'kalomaze',
                institution: "Independent researcher / kalomaze's kalomazing blog",
                homepage: 'https://kalomaze.bearblog.dev/blog/',
                avatar: 'https://github.com/kalomaze.png',
                matches: ['kalomaze'],
                specialty: 'Trustworthy AI',
                focus: ['GRPO', 'RL post-training', 'reward and sampling design'],
                qualityRank: 8
            },
            {
                name: 'Chip Huyen',
                institution: 'Author of AI Engineering / Designing Machine Learning Systems',
                homepage: 'https://huyenchip.com/blog/',
                avatar: 'https://github.com/chiphuyen.png',
                matches: ['Chip Huyen'],
                specialty: 'Research Craft',
                focus: ['ML systems design', 'AI engineering', 'production pitfalls'],
                qualityRank: 9
            },
            {
                name: 'Song Han',
                institution: 'MIT HAN Lab / NVIDIA Efficient AI',
                homepage: 'https://hanlab.mit.edu/',
                avatar: 'https://github.com/songhan.png',
                matches: ['Song Han'],
                specialty: 'Visual Generation',
                focus: ['efficient video generation', 'inference systems', 'hardware-aware ML'],
                qualityRank: 8
            },
            {
                name: 'Hugging Face',
                institution: 'Hugging Face Blog / Open-source ML',
                homepage: 'https://huggingface.co/blog',
                avatar: 'https://github.com/huggingface.png',
                matches: ['Hugging Face'],
                specialty: 'Efficient AI',
                focus: ['open models', 'training playbooks', 'inference optimization'],
                qualityRank: 9
            },
            {
                name: 'Qwen Team',
                institution: 'Alibaba Qwen',
                homepage: 'https://qwenlm.github.io/blog/',
                avatar: 'https://github.com/QwenLM.png',
                matches: ['Qwen Team', 'qwenlm.github.io'],
                specialty: 'Multimodal Model',
                focus: ['vision-language models', 'omni-modal models', 'image generation'],
                qualityRank: 8
            },
            {
                name: 'Ai2',
                institution: 'Allen Institute for AI',
                homepage: 'https://allenai.org/blog',
                avatar: 'https://github.com/allenai.png',
                matches: ['allenai.org', 'Ai2'],
                specialty: 'Foundation Model',
                focus: ['fully open models', 'post-training recipes', 'evaluation infrastructure'],
                qualityRank: 9
            },
            {
                name: 'Stanford Hazy Research',
                institution: 'Stanford University / Chris Ré lab',
                homepage: 'https://hazyresearch.stanford.edu/blog',
                avatar: 'https://github.com/HazyResearch.png',
                matches: ['Hazy Research', 'hazyresearch.stanford.edu'],
                specialty: 'Efficient AI',
                focus: ['linear attention', 'GPU kernels', 'data-centric AI'],
                qualityRank: 9
            },
            {
                name: 'Mistral AI',
                institution: 'Mistral AI',
                homepage: 'https://mistral.ai/news',
                avatar: 'https://github.com/mistralai.png',
                matches: ['Mistral AI'],
                specialty: 'Multimodal Model',
                focus: ['open-weight models', 'multimodal models', 'document intelligence'],
                qualityRank: 7
            },
            {
                name: 'Thinking Machines Lab',
                institution: 'Thinking Machines Lab / Connectionism',
                homepage: 'https://thinkingmachines.ai/blog/',
                avatar: 'https://www.google.com/s2/favicons?domain=thinkingmachines.ai&sz=128',
                matches: ['Thinking Machines Lab', 'thinkingmachines.ai'],
                specialty: 'Foundation Model',
                focus: ['open-weights models', 'deterministic inference', 'fine-tuning infrastructure'],
                qualityRank: 8
            },
            {
                name: 'Epoch AI',
                institution: 'Epoch AI Research',
                homepage: 'https://epoch.ai/blog',
                avatar: 'https://www.google.com/s2/favicons?domain=epoch.ai&sz=128',
                matches: ['Epoch AI', 'epoch.ai'],
                specialty: 'Frontier',
                focus: ['compute trends', 'AI forecasting', 'data center economics'],
                qualityRank: 8
            },
            {
                name: 'METR',
                institution: 'Model Evaluation & Threat Research',
                homepage: 'https://metr.org/blog/',
                avatar: 'https://www.google.com/s2/favicons?domain=metr.org&sz=128',
                matches: ['metr.org'],
                specialty: 'Trustworthy AI',
                focus: ['autonomy evaluations', 'time horizon measurement', 'frontier risk reports'],
                qualityRank: 8
            },
            {
                name: 'Physical Intelligence',
                institution: 'Physical Intelligence (π)',
                homepage: 'https://www.pi.website/blog',
                avatar: 'https://www.google.com/s2/favicons?domain=pi.website&sz=128',
                matches: ['Physical Intelligence', 'pi.website'],
                specialty: 'World Model',
                focus: ['vision-language-action models', 'generalist robot policies', 'open-world generalization'],
                qualityRank: 8
            },
            {
                name: 'World Labs',
                institution: 'World Labs / Spatial Intelligence',
                homepage: 'https://www.worldlabs.ai/blog',
                avatar: 'https://www.google.com/s2/favicons?domain=worldlabs.ai&sz=128',
                matches: ['World Labs', 'worldlabs.ai'],
                specialty: 'World Model',
                focus: ['3D world generation', 'spatial intelligence', 'real-time rendering'],
                qualityRank: 7
            },
            {
                name: 'Apollo Research',
                institution: 'Apollo Research',
                homepage: 'https://www.apolloresearch.ai/blog',
                avatar: 'https://www.google.com/s2/favicons?domain=apolloresearch.ai&sz=128',
                matches: ['Apollo Research', 'apolloresearch.ai'],
                specialty: 'Trustworthy AI',
                focus: ['scheming evaluations', 'loss-of-control preparedness', 'interpretability for safety'],
                qualityRank: 7
            },
            {
                name: 'UK AI Security Institute',
                institution: 'UK Government / AISI',
                homepage: 'https://www.aisi.gov.uk/',
                avatar: 'https://www.google.com/s2/favicons?domain=aisi.gov.uk&sz=128',
                matches: ['AI Security Institute', 'aisi.gov.uk'],
                specialty: 'Trustworthy AI',
                focus: ['frontier model evaluations', 'control red-teaming', 'safety cases'],
                qualityRank: 7
            }
        ];

        this.init();
    }

    async init() {
        this.setupTheme();
        this.setupEventListeners();
        await this.loadBloggers();
        this.applyFilters();
    }

    getStoredTheme() {
        try {
            const storedTheme = localStorage.getItem('theme');
            return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
        } catch (error) {
            return 'light';
        }
    }

    normalizeTheme(theme) {
        return theme === 'dark' || theme === 'light' ? theme : 'light';
    }

    getActiveTheme() {
        return this.normalizeTheme(document.documentElement.getAttribute('data-theme') || this.currentTheme || this.getStoredTheme());
    }

    applyTheme(theme) {
        const normalizedTheme = this.normalizeTheme(theme);
        this.currentTheme = normalizedTheme;
        document.documentElement.setAttribute('data-theme', normalizedTheme);
        document.documentElement.style.colorScheme = normalizedTheme;
        return normalizedTheme;
    }

    setupTheme() {
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        const activeTheme = this.getActiveTheme();
        const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(nextTheme);
        try {
            localStorage.setItem('theme', this.currentTheme);
        } catch (error) {
            // Keep the current page theme even if storage is unavailable.
        }
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        const activeTheme = this.getActiveTheme();

        if (activeTheme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
            themeToggle.setAttribute('aria-pressed', 'true');
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
            themeToggle.setAttribute('aria-pressed', 'false');
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        }
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && themeToggle.dataset.themeBound !== 'true') {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            themeToggle.dataset.themeBound = 'true';
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (event) => this.handleSearch(event.target.value));
        }

        const specialtyFilter = document.getElementById('specialtyFilter');
        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', (event) => {
                this.currentFilters.specialty = event.target.value;
                this.applyFilters();
            });
        }

        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (event) => {
                this.currentFilters.sort = event.target.value;
                this.applyFilters();
            });
        }

        document.addEventListener('click', (event) => {
            const card = event.target.closest('.author-card');
            if (!card || event.target.closest('a, button')) return;

            const homepage = card.dataset.homepage;
            if (homepage) {
                window.open(homepage, '_blank', 'noopener,noreferrer');
            }
        });
    }

    async loadBloggers() {
        const staticBlogs = typeof BlogXiv !== 'undefined'
            ? BlogXiv.prototype.getCuratedCommunityBlogs()
            : [];
        const blogs = window.BlogXivData
            ? await window.BlogXivData.getPublishedBlogs(staticBlogs)
            : staticBlogs;

        this.bloggers = this.profiles.map((profile) => {
            const posts = blogs.filter((blog) => this.matchesProfile(blog, profile));
            const sortedPosts = [...posts].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
            const categories = [...new Set(sortedPosts.map((post) => post.category).filter(Boolean))];
            const primaryCategory = categories.includes(profile.specialty)
                ? profile.specialty
                : categories[0] || profile.specialty;
            const latestPost = sortedPosts[0];

            return {
                ...profile,
                id: this.slugify(profile.name),
                specialty: primaryCategory,
                blogsCount: sortedPosts.length,
                domainsCount: categories.length || 1,
                lastActive: latestPost?.publishDate || '2024-01-01',
                impactScore: profile.qualityRank * 100 + sortedPosts.length * 16 + categories.length * 6,
                bio: this.buildBio(profile, sortedPosts, categories),
                tags: [...new Set([...profile.focus, ...categories])].slice(0, 5),
                recentBlogs: sortedPosts.slice(0, 3).map((post) => ({
                    title: post.title,
                    url: post.url
                })),
                postsUrl: this.buildPostsUrl(profile),
                profileUrl: profile.homepage
            };
        });
    }

    matchesProfile(blog, profile) {
        const haystack = [
            blog.author,
            blog.sourceName,
            blog.title,
            blog.url
        ].filter(Boolean).join(' ').toLowerCase();

        return profile.matches.some((match) => haystack.includes(match.toLowerCase()));
    }

    buildPostsUrl(profile) {
        const authorQuery = encodeURIComponent(profile.matches[0]);
        return `explore.html?author=${authorQuery}`;
    }

    buildBio(profile, posts, categories) {
        const countText = posts.length === 1 ? '1 indexed BlogrXiv article' : `${posts.length} indexed BlogrXiv articles`;
        const domains = categories.length ? categories.join(', ') : profile.specialty;
        return `${profile.name} is highlighted for ${profile.focus.join(', ')}. BlogrXiv currently indexes ${countText} spanning ${domains}.`;
    }

    applyFilters() {
        let filtered = [...this.bloggers];

        if (this.currentFilters.specialty !== 'all') {
            filtered = filtered.filter((blogger) =>
                blogger.specialty === this.currentFilters.specialty ||
                blogger.tags.includes(this.currentFilters.specialty)
            );
        }

        if (this.searchQuery.length >= 2) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter((blogger) =>
                blogger.name.toLowerCase().includes(query) ||
                blogger.institution.toLowerCase().includes(query) ||
                blogger.bio.toLowerCase().includes(query) ||
                blogger.specialty.toLowerCase().includes(query) ||
                blogger.tags.some((tag) => tag.toLowerCase().includes(query)) ||
                blogger.recentBlogs.some((blog) => blog.title.toLowerCase().includes(query))
            );
        }

        switch (this.currentFilters.sort) {
            case 'blogs':
                filtered.sort((a, b) => b.blogsCount - a.blogsCount || b.impactScore - a.impactScore);
                break;
            case 'recent':
                filtered.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'impact':
            default:
                filtered.sort((a, b) => b.impactScore - a.impactScore || b.blogsCount - a.blogsCount);
                break;
        }

        this.filteredBloggers = filtered;
        this.renderBloggers();
    }

    handleSearch(query) {
        this.searchQuery = query.trim();
        this.applyFilters();
    }

    renderBloggers() {
        const authorsGrid = document.getElementById('authorsGrid');
        if (!authorsGrid) return;

        if (this.filteredBloggers.length === 0) {
            authorsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No bloggers found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }

        authorsGrid.innerHTML = this.filteredBloggers.map((blogger) => this.renderBloggerCard(blogger)).join('');
    }

    renderBloggerCard(blogger) {
        return `
            <article class="author-card" data-homepage="${this.escapeAttribute(blogger.homepage)}" tabindex="0" role="article" aria-label="Open ${this.escapeAttribute(blogger.name)} homepage">
                <div class="author-header">
                    <img class="author-avatar" src="${this.escapeAttribute(blogger.avatar)}" alt="${this.escapeAttribute(blogger.name)}" loading="lazy" referrerpolicy="no-referrer">
                    <div class="author-info">
                        <h3 class="author-name">${this.escapeHTML(blogger.name)}</h3>
                        <p class="author-title">${this.escapeHTML(blogger.specialty)} Blogger</p>
                        <p class="author-institution">${this.escapeHTML(blogger.institution)}</p>
                    </div>
                </div>

                <div class="author-bio">
                    <p>${this.escapeHTML(blogger.bio)}</p>
                </div>

                <div class="author-tags">
                    ${blogger.tags.map((tag) => `<span class="tag">${this.escapeHTML(tag)}</span>`).join('')}
                </div>

                <div class="author-stats">
                    <div class="stat">
                        <span class="stat-number">${blogger.blogsCount}</span>
                        <span class="stat-label">Indexed</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${blogger.domainsCount}</span>
                        <span class="stat-label">Domains</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${this.formatYear(blogger.lastActive)}</span>
                        <span class="stat-label">Latest</span>
                    </div>
                </div>

                <div class="author-recent">
                    <h4>Representative Blogs:</h4>
                    <ul>
                        ${blogger.recentBlogs.map((blog) => `<li>${this.escapeHTML(blog.title)}</li>`).join('')}
                    </ul>
                </div>

                <div class="author-actions">
                    <a class="btn btn-outline" href="${this.escapeAttribute(blogger.postsUrl)}">
                        Indexed Posts
                    </a>
                    <a class="btn btn-primary" href="${this.escapeAttribute(blogger.profileUrl)}" target="_blank" rel="noopener noreferrer">
                        Homepage
                    </a>
                </div>
            </article>
        `;
    }

    formatYear(date) {
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime()) ? '—' : String(parsed.getFullYear());
    }

    slugify(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'blogger';
    }

    escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    escapeAttribute(value) {
        return this.escapeHTML(value).replace(/`/g, '&#096;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.loadingAnimation) {
        window.loadingAnimation.show('Loading blogger profiles...', 1200);
    }

    new BloggersPage();
});
