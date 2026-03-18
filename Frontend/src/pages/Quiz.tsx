import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

type HardcodedTopicKey =
    | 'cpp'
    | 'java'
    | 'database'
    | 'network'
    | 'arithmetic-aptitude'
    | 'data-interpretation'
    | 'verbal-ability'
    | 'logical-reasoning'
    | 'verbal-reasoning';

interface HardcodedQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface HardcodedTopic {
    key: HardcodedTopicKey;
    title: string;
    header: string;
    exerciseTitle: string;
    questions: HardcodedQuestion[];
}

interface AIQuestion {
    question: string;
    options: string[];
    correct_answer: string;
}

interface AIQuizResponse {
    topic: string;
    difficulty: string;
    time_limit: number;
    questions: AIQuestion[];
}

const QUESTIONS_PER_PAGE = 5;
const ML_SERVICE_URL = (import.meta.env.VITE_ML_SERVICE_URL || 'http://127.0.0.1:5001').replace(/\/$/, '');

const getPaginationItems = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 'ellipsis', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 'ellipsis', currentPage, 'ellipsis', totalPages];
};

const HARDCODED_QUIZ_TOPICS: HardcodedTopic[] = [
    {
        key: 'cpp',
        title: 'C++',
        header: 'C++ Programming :: OOPS Concepts',
        exerciseTitle: 'OOPS Concepts - General Questions',
        questions: [
            {
                id: 1,
                question: 'Which of the following type of class allows only one object of it to be created?',
                options: ['Virtual class', 'Abstract class', 'Singleton class', 'Friend class'],
                correctAnswer: 'Singleton class',
                explanation: 'Singleton class ensures only one instance can be created.',
            },
            {
                id: 2,
                question: 'Which of the following is not a type of constructor?',
                options: ['Copy constructor', 'Friend constructor', 'Default constructor', 'Parameterized constructor'],
                correctAnswer: 'Friend constructor',
                explanation: 'Friend constructor is not a valid constructor type in C++.',
            },
            {
                id: 3,
                question: 'Which of the following statements is correct?',
                options: [
                    'Base class pointer cannot point to derived class.',
                    'Derived class pointer cannot point to base class.',
                    'Pointer to derived class cannot be created.',
                    'Pointer to base class cannot be created.',
                ],
                correctAnswer: 'Derived class pointer cannot point to base class.',
                explanation: 'A derived-class pointer cannot directly point to a base-class object.',
            },
            {
                id: 4,
                question: 'Which of the following is not the member of class?',
                options: ['Static function', 'Friend function', 'Const function', 'Virtual function'],
                correctAnswer: 'Friend function',
                explanation: 'A friend function is not a member of the class, though it can access private members.',
            },
            {
                id: 5,
                question: 'Which of the following concepts means determining at runtime what method to invoke?',
                options: ['Data hiding', 'Dynamic Typing', 'Dynamic binding', 'Dynamic loading'],
                correctAnswer: 'Dynamic binding',
                explanation: 'Dynamic binding resolves method calls at runtime.',
            },
            {
                id: 6,
                question: 'Which of the following term is used for a function defined inside a class?',
                options: ['Member Variable', 'Member function', 'Class function', 'Classic function'],
                correctAnswer: 'Member function',
                explanation: 'A function defined inside a class is called a member function.',
            },
            {
                id: 7,
                question: 'Which of the following concept of oops allows compiler to insert arguments in a function call if it is not specified?',
                options: ['Call by value', 'Call by reference', 'Default arguments', 'Call by pointer'],
                correctAnswer: 'Default arguments',
                explanation: 'Default arguments are used when callers do not pass all parameters.',
            },
            {
                id: 8,
                question: 'How many instances of an abstract class can be created?',
                options: ['1', '5', '13', '0'],
                correctAnswer: '0',
                explanation: 'Abstract classes cannot be instantiated directly.',
            },
            {
                id: 9,
                question: 'Which of the following cannot be friend?',
                options: ['Function', 'Class', 'Object', 'Operator function'],
                correctAnswer: 'Object',
                explanation: 'Friendship is granted to functions or classes, not objects.',
            },
            {
                id: 10,
                question: 'Which of the following concepts of OOPS means exposing only necessary information to client?',
                options: ['Encapsulation', 'Abstraction', 'Data hiding', 'Data binding'],
                correctAnswer: 'Abstraction',
                explanation: 'Abstraction exposes essential details while hiding implementation complexity.',
            },
        ],
    },
    {
        key: 'java',
        title: 'Java',
        header: 'Java Programming :: OOP Concepts',
        exerciseTitle: 'OOP Concepts - General Questions',
        questions: [
            {
                id: 1,
                question: 'Which concept allows one class to acquire properties of another class?',
                options: ['Encapsulation', 'Inheritance', 'Abstraction', 'Polymorphism'],
                correctAnswer: 'Inheritance',
                explanation: 'Inheritance lets a class reuse fields and methods from another class.',
            },
            {
                id: 2,
                question: 'Which keyword is used to prevent method overriding in Java?',
                options: ['static', 'const', 'final', 'sealed'],
                correctAnswer: 'final',
                explanation: 'A method marked final cannot be overridden in subclasses.',
            },
            {
                id: 3,
                question: 'Which of these is used to achieve runtime polymorphism in Java?',
                options: ['Method overloading', 'Method overriding', 'Constructors', 'Interfaces only'],
                correctAnswer: 'Method overriding',
                explanation: 'Runtime polymorphism is primarily achieved by overriding methods.',
            },
            {
                id: 4,
                question: 'Which access modifier makes a member accessible only within the same class?',
                options: ['public', 'protected', 'private', 'default'],
                correctAnswer: 'private',
                explanation: 'private members are accessible only inside their own class.',
            },
            {
                id: 5,
                question: 'What is the default value of a boolean instance variable in Java?',
                options: ['true', 'false', '0', 'null'],
                correctAnswer: 'false',
                explanation: 'Default value of boolean instance variable is false.',
            },
            {
                id: 6,
                question: 'Which method is the entry point of a Java application?',
                options: ['start()', 'run()', 'main()', 'execute()'],
                correctAnswer: 'main()',
                explanation: 'Execution starts from the main method.',
            },
            {
                id: 7,
                question: 'Which collection does not allow duplicate elements?',
                options: ['List', 'Set', 'ArrayList', 'Vector'],
                correctAnswer: 'Set',
                explanation: 'Set implementations do not allow duplicates.',
            },
            {
                id: 8,
                question: 'Which keyword is used to inherit a class in Java?',
                options: ['implements', 'inherits', 'extends', 'super'],
                correctAnswer: 'extends',
                explanation: 'extends is used when one class inherits another class.',
            },
            {
                id: 9,
                question: 'Which exception is checked at compile time?',
                options: ['NullPointerException', 'ArithmeticException', 'IOException', 'ArrayIndexOutOfBoundsException'],
                correctAnswer: 'IOException',
                explanation: 'IOException is a checked exception and must be handled or declared.',
            },
            {
                id: 10,
                question: 'What does JVM stand for?',
                options: ['Java Variable Method', 'Java Virtual Machine', 'Joint Virtual Module', 'Java Verified Model'],
                correctAnswer: 'Java Virtual Machine',
                explanation: 'JVM stands for Java Virtual Machine.',
            },
        ],
    },
    {
        key: 'database',
        title: 'Database',
        header: 'Database :: General Questions',
        exerciseTitle: 'Database - General Questions',
        questions: [
            {
                id: 1,
                question: 'Which SQL command is used to remove all rows from a table while keeping the structure?',
                options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
                correctAnswer: 'TRUNCATE',
                explanation: 'TRUNCATE removes all rows and retains table schema.',
            },
            {
                id: 2,
                question: 'Which key uniquely identifies each row in a table?',
                options: ['Foreign key', 'Candidate key', 'Primary key', 'Composite key'],
                correctAnswer: 'Primary key',
                explanation: 'Primary key ensures each record is unique.',
            },
            {
                id: 3,
                question: 'Which normal form removes transitive dependency?',
                options: ['1NF', '2NF', '3NF', 'BCNF'],
                correctAnswer: '3NF',
                explanation: 'Third Normal Form eliminates transitive dependencies.',
            },
            {
                id: 4,
                question: 'Which JOIN returns all rows from both tables when there is a match in one of the tables?',
                options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
                correctAnswer: 'FULL OUTER JOIN',
                explanation: 'FULL OUTER JOIN includes matching and non-matching rows from both tables.',
            },
            {
                id: 5,
                question: 'What does ACID stand for in database transactions?',
                options: [
                    'Atomicity, Consistency, Isolation, Durability',
                    'Accuracy, Consistency, Integrity, Durability',
                    'Atomicity, Concurrency, Isolation, Dependency',
                    'Availability, Consistency, Isolation, Durability',
                ],
                correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
                explanation: 'ACID defines core properties of reliable transactions.',
            },
        ],
    },
    {
        key: 'network',
        title: 'Network',
        header: 'Computer Network :: General Questions',
        exerciseTitle: 'Network - General Questions',
        questions: [
            {
                id: 1,
                question: 'Which layer of the OSI model is responsible for routing?',
                options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
                correctAnswer: 'Network Layer',
                explanation: 'The network layer handles logical addressing and routing.',
            },
            {
                id: 2,
                question: 'Which protocol is used to automatically assign IP addresses?',
                options: ['DNS', 'DHCP', 'FTP', 'SNMP'],
                correctAnswer: 'DHCP',
                explanation: 'DHCP dynamically assigns IP configuration to hosts.',
            },
            {
                id: 3,
                question: 'What is the default port number for HTTPS?',
                options: ['21', '25', '80', '443'],
                correctAnswer: '443',
                explanation: 'HTTPS typically runs on port 443.',
            },
            {
                id: 4,
                question: 'Which device primarily operates at the Data Link layer?',
                options: ['Router', 'Switch', 'Gateway', 'Repeater'],
                correctAnswer: 'Switch',
                explanation: 'Layer-2 switches forward frames using MAC addresses.',
            },
            {
                id: 5,
                question: 'Which command is commonly used to test reachability between two hosts?',
                options: ['ipconfig', 'tracert', 'ping', 'netstat'],
                correctAnswer: 'ping',
                explanation: 'ping sends ICMP echo requests to test connectivity.',
            },
        ],
    },
    {
        key: 'arithmetic-aptitude',
        title: 'Arithmetic Aptitude',
        header: 'Arithmetic Aptitude :: General Questions',
        exerciseTitle: 'Arithmetic Aptitude - General Questions',
        questions: [
            { id: 1, question: 'What is 25% of 240?', options: ['48', '50', '60', '75'], correctAnswer: '60', explanation: '25% of 240 is 240 × 0.25 = 60.' },
            { id: 2, question: 'If x + 7 = 19, then x = ?', options: ['10', '11', '12', '13'], correctAnswer: '12', explanation: 'x = 19 - 7 = 12.' },
            { id: 3, question: 'The average of 10, 20 and 30 is:', options: ['15', '20', '25', '30'], correctAnswer: '20', explanation: '(10 + 20 + 30) / 3 = 20.' },
            { id: 4, question: 'A train covers 120 km in 2 hours. Its speed is:', options: ['40 km/h', '50 km/h', '60 km/h', '80 km/h'], correctAnswer: '60 km/h', explanation: 'Speed = Distance / Time = 120 / 2 = 60 km/h.' },
            { id: 5, question: 'What is 15% of 300?', options: ['30', '40', '45', '50'], correctAnswer: '45', explanation: '300 × 0.15 = 45.' },
            { id: 6, question: 'Find the next number: 2, 4, 8, 16, ?', options: ['18', '24', '30', '32'], correctAnswer: '32', explanation: 'Each term is doubled.' },
            { id: 7, question: 'Simple interest on ₹1000 at 10% per annum for 2 years is:', options: ['₹100', '₹150', '₹200', '₹250'], correctAnswer: '₹200', explanation: 'SI = (P×R×T)/100 = (1000×10×2)/100 = 200.' },
            { id: 8, question: 'What is the ratio of 40 to 100?', options: ['1:2', '2:5', '3:5', '4:5'], correctAnswer: '2:5', explanation: '40:100 simplifies to 2:5.' },
            { id: 9, question: 'If 5 workers finish a job in 12 days, how many days for 10 workers (same rate)?', options: ['4', '5', '6', '8'], correctAnswer: '6', explanation: 'Double workers means half time: 12/2 = 6.' },
            { id: 10, question: 'What is the value of 7²?', options: ['14', '21', '49', '64'], correctAnswer: '49', explanation: '7² = 49.' },
        ],
    },
    {
        key: 'data-interpretation',
        title: 'Data Interpretation',
        header: 'Data Interpretation :: General Questions',
        exerciseTitle: 'Data Interpretation - General Questions',
        questions: [
            { id: 1, question: 'A pie chart shows 40% sales from Product A. If total sales = 500, sales of A are:', options: ['150', '180', '200', '220'], correctAnswer: '200', explanation: '40% of 500 = 200.' },
            { id: 2, question: 'In a bar chart, values are 30, 45, 25. The highest is:', options: ['30', '45', '25', 'Cannot say'], correctAnswer: '45', explanation: '45 is the maximum among given values.' },
            { id: 3, question: 'If revenue grows from 200 to 260, percentage increase is:', options: ['20%', '25%', '30%', '35%'], correctAnswer: '30%', explanation: 'Increase = 60; 60/200 × 100 = 30%.' },
            { id: 4, question: 'Average of dataset 12, 18, 20, 10 is:', options: ['14', '15', '16', '17'], correctAnswer: '15', explanation: '(12+18+20+10)/4 = 15.' },
            { id: 5, question: 'Median of 4, 7, 9, 11, 13 is:', options: ['7', '9', '11', '13'], correctAnswer: '9', explanation: 'Middle value in sorted odd-size list is 9.' },
            { id: 6, question: 'Mode in 2, 3, 3, 5, 7 is:', options: ['2', '3', '5', '7'], correctAnswer: '3', explanation: '3 occurs most frequently.' },
            { id: 7, question: 'If Q1 = 80 and Q2 = 100, growth from Q1 to Q2 is:', options: ['20%', '22%', '25%', '30%'], correctAnswer: '25%', explanation: '(100-80)/80 × 100 = 25%.' },
            { id: 8, question: 'Total of values 15, 25, 35, 45 is:', options: ['100', '110', '120', '130'], correctAnswer: '120', explanation: '15+25+35+45 = 120.' },
            { id: 9, question: 'If two categories have values 60 and 40, their difference is:', options: ['10', '15', '20', '25'], correctAnswer: '20', explanation: '60 - 40 = 20.' },
            { id: 10, question: 'Share of 75 in total 300 is:', options: ['15%', '20%', '25%', '30%'], correctAnswer: '25%', explanation: '75/300 × 100 = 25%.' },
        ],
    },
    {
        key: 'verbal-ability',
        title: 'Verbal Ability',
        header: 'Verbal Ability :: General Questions',
        exerciseTitle: 'Verbal Ability - General Questions',
        questions: [
            { id: 1, question: 'Choose the synonym of "Brief":', options: ['Long', 'Short', 'Wide', 'Harsh'], correctAnswer: 'Short', explanation: 'Brief means short.' },
            { id: 2, question: 'Choose the antonym of "Expand":', options: ['Increase', 'Spread', 'Contract', 'Develop'], correctAnswer: 'Contract', explanation: 'Contract is the opposite of expand.' },
            { id: 3, question: 'Fill in the blank: She ____ to school every day.', options: ['go', 'goes', 'gone', 'going'], correctAnswer: 'goes', explanation: 'Subject-verb agreement with "She" needs "goes".' },
            { id: 4, question: 'Choose the correct spelling:', options: ['Definately', 'Definitely', 'Definatelyy', 'Definitly'], correctAnswer: 'Definitely', explanation: 'Definitely is correct.' },
            { id: 5, question: 'Select the correctly punctuated sentence:', options: ['Lets eat, grandma.', 'Let\'s eat grandma.', 'Lets eat grandma.', 'Let\'s eat, grandma.'], correctAnswer: 'Let\'s eat, grandma.', explanation: 'Comma changes the meaning correctly.' },
            { id: 6, question: 'Identify the noun: "The boy runs fast."', options: ['The', 'boy', 'runs', 'fast'], correctAnswer: 'boy', explanation: 'boy is the naming word (noun).' },
            { id: 7, question: 'Choose the correct passive voice: "They completed the work."', options: ['The work completed by them.', 'The work was completed by them.', 'The work is completed by them.', 'The work has completed by them.'], correctAnswer: 'The work was completed by them.', explanation: 'Simple past active converts to "was completed" in passive.' },
            { id: 8, question: 'Pick the odd word:', options: ['Apple', 'Banana', 'Carrot', 'Mango'], correctAnswer: 'Carrot', explanation: 'Carrot is a vegetable; others are fruits.' },
            { id: 9, question: 'Choose the idiom meaning of "Break the ice":', options: ['Shatter frozen water', 'Start a conversation', 'End a friendship', 'Ignore everyone'], correctAnswer: 'Start a conversation', explanation: 'Break the ice means to begin interaction comfortably.' },
            { id: 10, question: 'Choose the correct article: He is ___ honest man.', options: ['a', 'an', 'the', 'no article'], correctAnswer: 'an', explanation: 'Honest starts with vowel sound, so "an" is used.' },
        ],
    },
    {
        key: 'logical-reasoning',
        title: 'Logical Reasoning',
        header: 'Logical Reasoning :: General Questions',
        exerciseTitle: 'Logical Reasoning - General Questions',
        questions: [
            { id: 1, question: 'If all cats are animals and some animals are wild, which conclusion is definite?', options: ['All cats are wild', 'Some cats are wild', 'Cats are animals', 'No cats are wild'], correctAnswer: 'Cats are animals', explanation: 'Only direct universal statement is guaranteed.' },
            { id: 2, question: 'Find the odd one out: 2, 6, 12, 20, 30, 42, 55', options: ['20', '30', '42', '55'], correctAnswer: '55', explanation: 'Pattern is n(n+1): 1×2,2×3,3×4... next should be 56, not 55.' },
            { id: 3, question: 'If A > B and B > C, then:', options: ['A < C', 'A = C', 'A > C', 'Cannot determine'], correctAnswer: 'A > C', explanation: 'Transitive relation gives A > C.' },
            { id: 4, question: 'Complete the series: 3, 9, 27, ?', options: ['54', '81', '72', '90'], correctAnswer: '81', explanation: 'Multiply by 3 each time.' },
            { id: 5, question: 'If "PEN" is coded as "QFO", then "BOOK" is coded as:', options: ['CPPL', 'CPPM', 'CPPM', 'CPOL'], correctAnswer: 'CPPL', explanation: 'Each letter is shifted by +1: B→C, O→P, O→P, K→L.' },
            { id: 6, question: 'Which day comes 3 days after Monday?', options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], correctAnswer: 'Thursday', explanation: 'Monday + 3 days = Thursday.' },
            { id: 7, question: 'Statement: Some books are pens. Conclusion: Some pens are books.', options: ['True', 'False', 'Either true or false', 'Cannot say'], correctAnswer: 'True', explanation: 'Some relation is reversible in this case.' },
            { id: 8, question: 'If SOUTH is written as HTUOS, then NORTH is written as:', options: ['HTRON', 'HTRON', 'HTRON', 'HRTON'], correctAnswer: 'HTRON', explanation: 'It is reversed spelling.' },
            { id: 9, question: 'Find missing number: 5, 10, 20, 40, ?', options: ['50', '60', '70', '80'], correctAnswer: '80', explanation: 'Each term doubles.' },
            { id: 10, question: 'If all roses are flowers and no flower is blue, then roses are:', options: ['Blue', 'Not blue', 'Both blue and not blue', 'Cannot say'], correctAnswer: 'Not blue', explanation: 'Given no flower is blue, roses are not blue.' },
        ],
    },
    {
        key: 'verbal-reasoning',
        title: 'Verbal Reasoning',
        header: 'Verbal Reasoning :: General Questions',
        exerciseTitle: 'Verbal Reasoning - General Questions',
        questions: [
            { id: 1, question: 'Find the relationship: Doctor : Hospital :: Teacher : ?', options: ['Book', 'Classroom', 'Student', 'Pen'], correctAnswer: 'Classroom', explanation: 'Doctor works in hospital; teacher works in classroom/school.' },
            { id: 2, question: 'Choose the odd pair:', options: ['Bird : Nest', 'Bee : Hive', 'Dog : Kennel', 'Cow : Stable'], correctAnswer: 'Cow : Stable', explanation: 'Common expected pair is Cow : Shed; others are standard fixed pairs.' },
            { id: 3, question: 'If "MANGO" is coded as "NZOHQ", code of "APPLE" is:', options: ['BQQMF', 'BQQLE', 'BPQMF', 'AQQMF'], correctAnswer: 'BQQMF', explanation: 'Each letter shifted by +1.' },
            { id: 4, question: 'Arrange words logically: 1.Seed 2.Tree 3.Fruit 4.Plant', options: ['1,4,2,3', '1,2,4,3', '4,1,2,3', '1,4,3,2'], correctAnswer: '1,4,2,3', explanation: 'Seed → Plant → Tree → Fruit.' },
            { id: 5, question: 'Choose the pair with same relationship: Day : Night', options: ['Hot : Cold', 'Sun : Moon', 'Light : Lamp', 'Sky : Cloud'], correctAnswer: 'Hot : Cold', explanation: 'Day/Night are opposites; Hot/Cold are opposites.' },
            { id: 6, question: 'Find the next word: A, C, E, G, ?', options: ['H', 'I', 'J', 'K'], correctAnswer: 'I', explanation: 'Skipping one letter each time.' },
            { id: 7, question: 'Statement: All pencils are pens. All pens are papers. Conclusion: All pencils are papers.', options: ['True', 'False', 'Uncertain', 'None'], correctAnswer: 'True', explanation: 'Syllogism transitivity applies.' },
            { id: 8, question: 'Choose the correct meaning of proverb "A stitch in time saves nine".', options: ['Sewing is useful', 'Act promptly to avoid bigger problem', 'Do nine tasks daily', 'Save thread'], correctAnswer: 'Act promptly to avoid bigger problem', explanation: 'Early action prevents larger trouble.' },
            { id: 9, question: 'Pick the odd word: Judge, Magistrate, Lawyer, Court', options: ['Judge', 'Magistrate', 'Lawyer', 'Court'], correctAnswer: 'Court', explanation: 'Court is a place/institution; others are persons.' },
            { id: 10, question: 'If RAM is older than SHYAM, and SHYAM older than GEETA, who is youngest?', options: ['RAM', 'SHYAM', 'GEETA', 'Cannot determine'], correctAnswer: 'GEETA', explanation: 'GEETA is younger than both.' },
        ],
    },
];

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAIRoute = location.pathname === '/quiz/ai';

    const [activeTab, setActiveTab] = useState<'hardcoded' | 'ai'>(isAIRoute ? 'ai' : 'hardcoded');
    const [selectedHardcodedTopic, setSelectedHardcodedTopic] = useState<HardcodedTopicKey>('cpp');
    const [currentHardcodedPage, setCurrentHardcodedPage] = useState(1);

    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [topic, setTopic] = useState('React');
    const [difficulty, setDifficulty] = useState('easy');
    const [numQuestions, setNumQuestions] = useState(5);
    const [timeLimit, setTimeLimit] = useState(10);
    const [loadingLevels, setLoadingLevels] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [levelsData, setLevelsData] = useState<{ difficulty: string; subtopics: string[] }[]>([]);
    const [aiQuiz, setAiQuiz] = useState<AIQuizResponse | null>(null);
    const [aiAnswers, setAiAnswers] = useState<Record<number, string>>({});

    useEffect(() => {
        setActiveTab(isAIRoute ? 'ai' : 'hardcoded');
    }, [isAIRoute]);

    const selectedTopicData = useMemo(
        () => HARDCODED_QUIZ_TOPICS.find((topicItem) => topicItem.key === selectedHardcodedTopic) || HARDCODED_QUIZ_TOPICS[0],
        [selectedHardcodedTopic]
    );

    const makeQuestionKey = (topicKey: HardcodedTopicKey, questionId: number) => `${topicKey}-${questionId}`;

    const totalHardcodedPages = Math.max(1, Math.ceil(selectedTopicData.questions.length / QUESTIONS_PER_PAGE));
    const paginatedQuestions = useMemo(() => {
        const startIndex = (currentHardcodedPage - 1) * QUESTIONS_PER_PAGE;
        return selectedTopicData.questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
    }, [selectedTopicData.questions, currentHardcodedPage]);
    const hardcodedPageItems = useMemo(
        () => getPaginationItems(currentHardcodedPage, totalHardcodedPages),
        [currentHardcodedPage, totalHardcodedPages]
    );

    const hardcodedScore = useMemo(() => {
        return selectedTopicData.questions.reduce((score, question) => {
            const answerKey = makeQuestionKey(selectedTopicData.key, question.id);
            return answers[answerKey] === question.correctAnswer ? score + 1 : score;
        }, 0);
    }, [answers, selectedTopicData]);

    const aiScore = useMemo(() => {
        if (!aiQuiz) return 0;
        return aiQuiz.questions.reduce((score, question, index) => {
            return aiAnswers[index] === question.correct_answer ? score + 1 : score;
        }, 0);
    }, [aiQuiz, aiAnswers]);

    const fetchLevels = async () => {
        if (!topic.trim()) return;
        setLoadingLevels(true);
        try {
            const res = await fetch(`${ML_SERVICE_URL}/get-levels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            const data = await res.json();
            setLevelsData(data.levels || []);
        } catch {
            alert('Unable to fetch levels. Check VITE_ML_SERVICE_URL and ML service availability.');
        } finally {
            setLoadingLevels(false);
        }
    };

    const generateAIQuiz = async () => {
        if (!topic.trim()) {
            alert('Please enter a topic');
            return;
        }

        setLoadingQuiz(true);
        try {
            const res = await fetch(`${ML_SERVICE_URL}/generate-quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    num_questions: numQuestions,
                    time_limit: timeLimit,
                }),
            });

            const data = await res.json();
            setAiQuiz(data);
            setAiAnswers({});
        } catch {
            alert('Unable to generate AI quiz. Check VITE_ML_SERVICE_URL and ML service/GROQ configuration.');
        } finally {
            setLoadingQuiz(false);
        }
    };

    return (
        <div className="quiz-theme min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            <style>
                {`
                    .quiz-noise {
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                        opacity: 0.03;
                        pointer-events: none;
                    }

                    .quiz-grid {
                        background-size: 40px 40px;
                        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    }

                    .quiz-theme .quiz-content .bg-white,
                    .quiz-theme .quiz-content .bg-gray-50,
                    .quiz-theme .quiz-content .bg-gray-100 {
                        background-color: rgba(18, 22, 32, 0.84) !important;
                    }

                    .quiz-theme .quiz-content .border-gray-100,
                    .quiz-theme .quiz-content .border-gray-200,
                    .quiz-theme .quiz-content .border-gray-300 {
                        border-color: rgba(255, 255, 255, 0.14) !important;
                    }

                    .quiz-theme .quiz-content .text-gray-900,
                    .quiz-theme .quiz-content .text-gray-800,
                    .quiz-theme .quiz-content .text-gray-700 {
                        color: #f3f4f6 !important;
                    }

                    .quiz-theme .quiz-content .text-gray-600,
                    .quiz-theme .quiz-content .text-gray-500,
                    .quiz-theme .quiz-content .text-gray-400 {
                        color: #9ca3af !important;
                    }

                    .quiz-theme .quiz-content input,
                    .quiz-theme .quiz-content textarea,
                    .quiz-theme .quiz-content select {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: #f9fafb !important;
                        border-color: rgba(255, 255, 255, 0.18) !important;
                    }

                    .quiz-theme .quiz-content input::placeholder,
                    .quiz-theme .quiz-content textarea::placeholder {
                        color: #94a3b8 !important;
                    }
                `}
            </style>

            <div className="fixed inset-0 quiz-noise z-0 mix-blend-overlay"></div>
            <div className="fixed inset-0 quiz-grid z-0"></div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"></div>

            <Navigation />
            <main className="quiz-content relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 rounded-2xl border border-white/10 bg-[#121620]/85 px-6 py-5 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <h1 className="text-3xl font-bold font-syne text-white">Quiz Center</h1>
                </div>

                {activeTab === 'hardcoded' ? (
                    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                        <aside className="rounded-2xl border border-white/10 bg-[#121620]/85 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Topics</h2>
                            <div className="space-y-2">
                                {HARDCODED_QUIZ_TOPICS.map((topicItem, index) => (
                                    <div key={topicItem.key}>
                                        {topicItem.key === 'arithmetic-aptitude' && index > 0 && (
                                            <div className="my-6 border-t border-gray-300" />
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedHardcodedTopic(topicItem.key);
                                                setCurrentHardcodedPage(1);
                                            }}
                                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                                                selectedHardcodedTopic === topicItem.key
                                                    ? 'border-amber-400 bg-amber-500/10 text-amber-200'
                                                    : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/10'
                                            }`}
                                        >
                                            {topicItem.title}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <section className="rounded-2xl border border-white/10 bg-[#121620]/85 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
                            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{selectedTopicData.header}</h2>
                                    <p className="mt-2 text-sm font-medium text-amber-600">
                                        Score: {hardcodedScore}/{selectedTopicData.questions.length}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/quiz/ai')}
                                    className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-semibold text-[#0A0D14] transition hover:from-amber-400 hover:to-amber-500"
                                >
                                    Try AI Quiz
                                </button>
                            </div>

                            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                <p className="text-2xl font-semibold text-white">
                                    Exercise : <span className="text-amber-600">{selectedTopicData.exerciseTitle}</span>
                                </p>
                                <p className="mt-2 rounded-lg border border-white/10 bg-[#121620]/70 px-3 py-2 text-base font-semibold text-amber-400">
                                    {selectedTopicData.exerciseTitle}
                                </p>
                            </div>

                            <div className="space-y-5">
                                {paginatedQuestions.map((question) => {
                                    const answerKey = makeQuestionKey(selectedTopicData.key, question.id);
                                    const selected = answers[answerKey];
                                    const checked = Boolean(selected);
                                    const isCorrect = selected === question.correctAnswer;

                                    return (
                                        <div key={`${selectedTopicData.key}-${question.id}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                            <p className="mb-3 text-2xl font-semibold text-gray-100">
                                                {question.id}. <span className="text-xl font-medium">{question.question}</span>
                                            </p>

                                            <div className="space-y-2">
                                                {question.options.map((option, optionIndex) => (
                                                    (() => {
                                                        const isSelected = selected === option;
                                                        const isCorrectOption = option === question.correctAnswer;
                                                        const isWrongSelected = checked && isSelected && !isCorrectOption;
                                                        const isCorrectSelected = checked && isSelected && isCorrectOption;

                                                        return (
                                                    <label
                                                        key={option}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-base transition ${
                                                            isCorrectSelected
                                                                ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                                                : isWrongSelected
                                                                    ? 'border-red-300 bg-red-50 text-red-700 opacity-55 blur-[1px]'
                                                                    : isSelected
                                                                        ? 'border-amber-400/40 bg-amber-500/10'
                                                                        : checked
                                                                            ? 'border-white/10 bg-[#121620]/70 text-gray-500'
                                                                            : 'border-white/10 bg-[#121620]/70 hover:bg-white/10'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${selectedTopicData.key}-${question.id}`}
                                                            checked={selected === option}
                                                            onChange={() => setAnswers(prev => ({ ...prev, [answerKey]: option }))}
                                                        />
                                                        <span className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-500 text-sm font-semibold text-gray-200">
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </span>
                                                        <span>{option}</span>

                                                        {isCorrectSelected && (
                                                            <span className="ml-auto text-xs font-semibold text-emerald-700">✔ Correct</span>
                                                        )}
                                                    </label>
                                                        );
                                                    })()
                                                ))}
                                            </div>

                                            <div className="mt-3 flex items-center gap-3">
                                                {checked && (
                                                    <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isCorrect ? '✅ Correct' : '❌ Wrong'}
                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })}

                                {selectedTopicData.questions.length > QUESTIONS_PER_PAGE && (
                                    <div className="flex flex-wrap items-center justify-center gap-0 overflow-hidden rounded-lg border border-white/15 bg-[#121620]/80 text-base">
                                        <button
                                            onClick={() => setCurrentHardcodedPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentHardcodedPage === 1}
                                            className="border-r border-white/15 px-4 py-2 text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Prev
                                        </button>

                                        {hardcodedPageItems.map((item, index) => {
                                            if (item === 'ellipsis') {
                                                return (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="border-r border-white/15 px-4 py-2 text-gray-500"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const isActive = item === currentHardcodedPage;

                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => setCurrentHardcodedPage(item)}
                                                    className={`border-r border-white/15 px-4 py-2 transition ${
                                                        isActive
                                                            ? 'bg-amber-400 font-semibold text-gray-900'
                                                            : 'text-gray-200 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {item}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentHardcodedPage((prev) => Math.min(totalHardcodedPages, prev + 1))}
                                            disabled={currentHardcodedPage === totalHardcodedPages}
                                            className="px-4 py-2 text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">Generate Quiz with AI</h2>
                                <button
                                    onClick={() => navigate('/quiz')}
                                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10"
                                >
                                    Back to Hardcoded
                                </button>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-300">Topic</label>
                                    <input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                                        placeholder="e.g., React Hooks"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-300">Difficulty</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                        <option value="hardest">Hardest</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-300">No. of Questions</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(Number(e.target.value || 1))}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-300">Time Limit (minutes)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={timeLimit}
                                        onChange={(e) => setTimeLimit(Number(e.target.value || 1))}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={fetchLevels}
                                    disabled={loadingLevels}
                                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                                >
                                    {loadingLevels ? 'Loading Levels...' : 'Get Levels'}
                                </button>
                                <button
                                    onClick={generateAIQuiz}
                                    disabled={loadingQuiz}
                                    className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-[#0A0D14] transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                                >
                                    {loadingQuiz ? 'Generating...' : 'Generate Quiz'}
                                </button>
                            </div>

                            {levelsData.length > 0 && (
                                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
                                    <p className="mb-2 text-sm font-semibold text-gray-200">Suggested Difficulty Levels</p>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {levelsData.map((level) => (
                                            <div key={level.difficulty} className="rounded border border-white/10 bg-[#121620]/70 p-2">
                                                <p className="text-xs font-semibold uppercase text-amber-300">{level.difficulty}</p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {level.subtopics?.length ? level.subtopics.join(', ') : 'No subtopics'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {aiQuiz && (
                            <div className="rounded-2xl border border-white/10 bg-[#121620]/85 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">
                                        {aiQuiz.topic} • {aiQuiz.difficulty}
                                    </h3>
                                    <p className="text-sm font-medium text-amber-300">
                                        Score: {aiScore}/{aiQuiz.questions.length}
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    {aiQuiz.questions.map((question, index) => {
                                        const selected = aiAnswers[index];
                                        const checked = Boolean(selected);
                                        const isCorrect = selected === question.correct_answer;

                                        return (
                                            <div key={`${question.question}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                                <p className="mb-3 font-medium text-gray-100">{index + 1}. {question.question}</p>

                                                <div className="space-y-2">
                                                    {question.options.map((option) => (
                                                        (() => {
                                                            const isSelected = selected === option;
                                                            const isCorrectOption = option === question.correct_answer;
                                                            const isWrongSelected = checked && isSelected && !isCorrectOption;
                                                            const isCorrectSelected = checked && isSelected && isCorrectOption;

                                                            return (
                                                        <label
                                                            key={option}
                                                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                                                                isCorrectSelected
                                                                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                                                    : isWrongSelected
                                                                        ? 'border-red-300 bg-red-50 text-red-700 opacity-55 blur-[1px]'
                                                                        : isSelected
                                                                            ? 'border-amber-400/40 bg-amber-500/10'
                                                                            : checked
                                                                                ? 'border-white/10 bg-[#121620]/70 text-gray-500'
                                                                                : 'border-white/10 bg-[#121620]/70 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`ai-question-${index}`}
                                                                checked={selected === option}
                                                                onChange={() => setAiAnswers(prev => ({ ...prev, [index]: option }))}
                                                            />
                                                            {option}

                                                            {isCorrectSelected && (
                                                                <span className="ml-auto text-xs font-semibold text-emerald-700">✔ Correct</span>
                                                            )}
                                                        </label>
                                                            );
                                                        })()
                                                    ))}
                                                </div>

                                                <div className="mt-3 flex items-center gap-3">
                                                    {checked && (
                                                        <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                            {isCorrect ? '✅ Correct' : '❌ Wrong'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Quiz;