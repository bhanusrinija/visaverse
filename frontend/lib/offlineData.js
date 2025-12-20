// Offline data for common languages and countries

export const offlineLanguageData = {
    German: {
        country: 'Germany',
        categories: [
            {
                category: 'Greetings',
                phrases: [
                    { english: 'Hello', local: 'Hallo', pronunciation: 'HAH-loh' },
                    { english: 'Good morning', local: 'Guten Morgen', pronunciation: 'GOO-ten MOR-gen' },
                    { english: 'Good evening', local: 'Guten Abend', pronunciation: 'GOO-ten AH-bent' },
                    { english: 'Thank you', local: 'Danke', pronunciation: 'DAHN-keh' },
                    { english: 'Please', local: 'Bitte', pronunciation: 'BIT-teh' },
                    { english: 'Goodbye', local: 'Auf Wiedersehen', pronunciation: 'owf VEE-der-zay-en' },
                    { english: 'Yes', local: 'Ja', pronunciation: 'yah' },
                    { english: 'No', local: 'Nein', pronunciation: 'nine' }
                ]
            },
            {
                category: 'Shopping',
                phrases: [
                    { english: 'How much?', local: 'Wie viel kostet das?', pronunciation: 'vee feel KOS-tet dahs' },
                    { english: 'I would like...', local: 'Ich möchte...', pronunciation: 'ish MŒSH-teh' },
                    { english: 'Do you accept cards?', local: 'Akzeptieren Sie Karten?', pronunciation: 'ak-tsep-TEE-ren zee KAR-ten' },
                    { english: 'Receipt please', local: 'Quittung bitte', pronunciation: 'KVIT-toong BIT-teh' },
                    { english: 'Too expensive', local: 'Zu teuer', pronunciation: 'tsoo TOY-er' }
                ]
            },
            {
                category: 'Transport',
                phrases: [
                    { english: 'Where is...?', local: 'Wo ist...?', pronunciation: 'voh ist' },
                    { english: 'Train station', local: 'Bahnhof', pronunciation: 'BAHN-hohf' },
                    { english: 'Airport', local: 'Flughafen', pronunciation: 'FLOOG-hah-fen' },
                    { english: 'Ticket', local: 'Fahrkarte', pronunciation: 'FAR-kar-teh' },
                    { english: 'How do I get to...?', local: 'Wie komme ich zu...?', pronunciation: 'vee KOM-eh ish tsoo' }
                ]
            },
            {
                category: 'Emergency',
                phrases: [
                    { english: 'Help!', local: 'Hilfe!', pronunciation: 'HIL-feh' },
                    { english: 'Emergency', local: 'Notfall', pronunciation: 'NOHT-fahl' },
                    { english: 'Hospital', local: 'Krankenhaus', pronunciation: 'KRAN-ken-house' },
                    { english: 'Police', local: 'Polizei', pronunciation: 'po-lee-TSAI' },
                    { english: 'I need a doctor', local: 'Ich brauche einen Arzt', pronunciation: 'ish BROW-kheh I-nen artst' }
                ]
            },
            {
                category: 'Food',
                phrases: [
                    { english: 'Menu please', local: 'Speisekarte bitte', pronunciation: 'SHPY-zeh-kar-teh BIT-teh' },
                    { english: 'Water', local: 'Wasser', pronunciation: 'VAS-ser' },
                    { english: 'Bill please', local: 'Rechnung bitte', pronunciation: 'REKH-noong BIT-teh' },
                    { english: 'Delicious', local: 'Lecker', pronunciation: 'LEK-ker' },
                    { english: 'I am vegetarian', local: 'Ich bin Vegetarier', pronunciation: 'ish bin veg-eh-TAH-ree-er' }
                ]
            }
        ]
    },
    Spanish: {
        country: 'Spain',
        categories: [
            {
                category: 'Greetings',
                phrases: [
                    { english: 'Hello', local: 'Hola', pronunciation: 'OH-lah' },
                    { english: 'Good morning', local: 'Buenos días', pronunciation: 'BWEH-nos DEE-as' },
                    { english: 'Good evening', local: 'Buenas tardes', pronunciation: 'BWEH-nas TAR-des' },
                    { english: 'Thank you', local: 'Gracias', pronunciation: 'GRAH-see-as' },
                    { english: 'Please', local: 'Por favor', pronunciation: 'por fah-VOR' },
                    { english: 'Goodbye', local: 'Adiós', pronunciation: 'ah-dee-OHS' }
                ]
            },
            {
                category: 'Shopping',
                phrases: [
                    { english: 'How much?', local: '¿Cuánto cuesta?', pronunciation: 'KWAN-toh KWES-tah' },
                    { english: 'I would like...', local: 'Quisiera...', pronunciation: 'kee-see-EH-rah' },
                    { english: 'Too expensive', local: 'Muy caro', pronunciation: 'mwee KAH-roh' }
                ]
            },
            {
                category: 'Emergency',
                phrases: [
                    { english: 'Help!', local: '¡Ayuda!', pronunciation: 'ah-YOO-dah' },
                    { english: 'Hospital', local: 'Hospital', pronunciation: 'os-pee-TAHL' },
                    { english: 'Police', local: 'Policía', pronunciation: 'po-lee-SEE-ah' }
                ]
            }
        ]
    },
    French: {
        country: 'France',
        categories: [
            {
                category: 'Greetings',
                phrases: [
                    { english: 'Hello', local: 'Bonjour', pronunciation: 'bon-ZHOOR' },
                    { english: 'Good evening', local: 'Bonsoir', pronunciation: 'bon-SWAHR' },
                    { english: 'Thank you', local: 'Merci', pronunciation: 'mehr-SEE' },
                    { english: 'Please', local: "S'il vous plaît", pronunciation: 'seel voo PLEH' },
                    { english: 'Goodbye', local: 'Au revoir', pronunciation: 'oh reh-VWAHR' }
                ]
            },
            {
                category: 'Emergency',
                phrases: [
                    { english: 'Help!', local: 'Au secours!', pronunciation: 'oh seh-KOOR' },
                    { english: 'Hospital', local: 'Hôpital', pronunciation: 'oh-pee-TAHL' },
                    { english: 'Police', local: 'Police', pronunciation: 'po-LEES' }
                ]
            }
        ]
    }
};

export const offlineCultureData = {
    Germany: {
        country: 'Germany',
        categories: [
            {
                category: 'Greetings & Social Norms',
                tips: [
                    'Handshakes are the standard greeting in professional settings',
                    'Maintain eye contact during conversations - it shows honesty and respect',
                    'Germans value personal space - keep about an arm\'s length distance',
                    'Use formal titles (Herr/Frau + last name) until invited to use first names'
                ]
            },
            {
                category: 'Workplace Etiquette',
                tips: [
                    'Punctuality is extremely important - being late is considered disrespectful',
                    'Meetings are structured and agenda-driven',
                    'Direct communication is valued - be clear and straightforward',
                    'Work-life balance is respected - avoid calling colleagues after work hours'
                ]
            },
            {
                category: 'Public Behavior',
                tips: [
                    'Jaywalking is frowned upon - always use crosswalks',
                    'Keep noise levels low in public spaces and after 10 PM',
                    'Recycling is taken very seriously - learn the sorting system',
                    'Queue properly and wait your turn'
                ]
            },
            {
                category: 'Tipping Culture',
                tips: [
                    'Round up to nearest euro or add 5-10% in restaurants',
                    'Tip is included in bill but rounding up is appreciated',
                    'Hand tip directly to server, don\'t leave on table'
                ]
            }
        ],
        general_advice: 'Germans value efficiency, punctuality, and direct communication. While they may seem reserved initially, they are warm once you build a relationship. Respect rules and regulations, as they are taken seriously.'
    },
    Spain: {
        country: 'Spain',
        categories: [
            {
                category: 'Greetings & Social Norms',
                tips: [
                    'Two kisses on the cheek (right then left) are common among friends',
                    'Handshakes for formal/business settings',
                    'Spaniards are warm and expressive in communication',
                    'Personal space is smaller than in Northern Europe'
                ]
            },
            {
                category: 'Workplace Etiquette',
                tips: [
                    'Work-life balance is important - long lunch breaks are common',
                    'Relationships matter - building personal connections is valued',
                    'Meetings may start a bit late - more flexible with time',
                    'Dress professionally but stylishly'
                ]
            },
            {
                category: 'Public Behavior',
                tips: [
                    'Dinner is typically eaten late (9-10 PM)',
                    'Siesta time (2-5 PM) - many shops close',
                    'Speaking loudly is normal and not considered rude',
                    'Smoking is common in outdoor areas'
                ]
            }
        ],
        general_advice: 'Spanish culture values relationships, family, and enjoying life. Be prepared for a more relaxed approach to time and embrace the social aspects of daily life.'
    }
};
