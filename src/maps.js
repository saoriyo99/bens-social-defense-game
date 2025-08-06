// Maps - Progressive difficulty with multiple paths
const maps = [
    {
        name: "Local Dev Environment",
        desc: "Simple setup - just you and your code",
        difficulty: "⭐",
        theme: "Setting up the basic development environment",
        paths: [
            [
                {x: 0, y: 300},
                {x: 150, y: 300},
                {x: 150, y: 150},
                {x: 350, y: 150},
                {x: 350, y: 450},
                {x: 550, y: 450},
                {x: 550, y: 250},
                {x: 700, y: 250},
                {x: 750, y: 250}
            ]
        ],
        spawns: [{x: 0, y: 300, pathIndex: 0}]
    },
    {
        name: "Function Library",
        desc: "Building reusable functions - two ways in",
        difficulty: "⭐⭐",
        theme: "Writing modular, reusable code functions",
        paths: [
            [
                {x: 0, y: 200},
                {x: 200, y: 200},
                {x: 200, y: 300},
                {x: 400, y: 300},
                {x: 400, y: 400},
                {x: 600, y: 400},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 400},
                {x: 150, y: 400},
                {x: 150, y: 300},
                {x: 400, y: 300},
                {x: 400, y: 400},
                {x: 600, y: 400},
                {x: 750, y: 250}
            ]
        ],
        spawns: [
            {x: 0, y: 200, pathIndex: 0},
            {x: 0, y: 400, pathIndex: 1}
        ]
    },
    {
        name: "API Integration",
        desc: "Connecting to external services - three endpoints",
        difficulty: "⭐⭐⭐",
        theme: "Integrating with third-party APIs and services",
        paths: [
            [
                {x: 0, y: 150},
                {x: 250, y: 150},
                {x: 250, y: 250},
                {x: 500, y: 250},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 300},
                {x: 200, y: 300},
                {x: 200, y: 250},
                {x: 500, y: 250},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 450},
                {x: 300, y: 450},
                {x: 300, y: 350},
                {x: 500, y: 350},
                {x: 500, y: 250},
                {x: 750, y: 250}
            ]
        ],
        spawns: [
            {x: 0, y: 150, pathIndex: 0},
            {x: 0, y: 300, pathIndex: 1},
            {x: 0, y: 450, pathIndex: 2}
        ]
    },
    {
        name: "Testing Suite",
        desc: "Comprehensive testing - bugs everywhere!",
        difficulty: "⭐⭐⭐⭐",
        theme: "Writing unit tests, integration tests, and debugging",
        paths: [
            [
                {x: 0, y: 100},
                {x: 150, y: 100},
                {x: 150, y: 200},
                {x: 300, y: 200},
                {x: 300, y: 300},
                {x: 600, y: 300},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 300},
                {x: 100, y: 300},
                {x: 100, y: 400},
                {x: 250, y: 400},
                {x: 250, y: 300},
                {x: 600, y: 300},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 500},
                {x: 200, y: 500},
                {x: 200, y: 350},
                {x: 400, y: 350},
                {x: 400, y: 300},
                {x: 600, y: 300},
                {x: 750, y: 250}
            ]
        ],
        spawns: [
            {x: 0, y: 100, pathIndex: 0},
            {x: 0, y: 300, pathIndex: 1},
            {x: 0, y: 500, pathIndex: 2}
        ]
    },
    {
        name: "Production Deployment",
        desc: "Going live - maximum chaos!",
        difficulty: "⭐⭐⭐⭐⭐",
        theme: "Deploying to production and handling real users",
        paths: [
            [
                {x: 0, y: 80},
                {x: 120, y: 80},
                {x: 120, y: 180},
                {x: 300, y: 180},
                {x: 300, y: 280},
                {x: 650, y: 280},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 220},
                {x: 180, y: 220},
                {x: 180, y: 280},
                {x: 650, y: 280},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 380},
                {x: 150, y: 380},
                {x: 150, y: 320},
                {x: 450, y: 320},
                {x: 450, y: 280},
                {x: 650, y: 280},
                {x: 750, y: 250}
            ],
            [
                {x: 0, y: 520},
                {x: 250, y: 520},
                {x: 250, y: 420},
                {x: 500, y: 420},
                {x: 500, y: 320},
                {x: 450, y: 320},
                {x: 450, y: 280},
                {x: 650, y: 280},
                {x: 750, y: 250}
            ]
        ],
        spawns: [
            {x: 0, y: 80, pathIndex: 0},
            {x: 0, y: 220, pathIndex: 1},
            {x: 0, y: 380, pathIndex: 2},
            {x: 0, y: 520, pathIndex: 3}
        ]
    }
];

export { maps };
