export let mockPosts = [
  {
    id: 1,
    username: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    created: '2 hours ago',
    content: 'Just finished an amazing hike in the mountains! The view from the top was absolutely breathtaking. 🏔️',
    likes: 156,
    comments: 23,
    shares: 8,
    isLiked: false,
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Mountain landscape',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Mountain peak',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Mountain trail',
      },
    ],
  },
  {
    id: 2,
    username: 'Bob Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    created: '5 hours ago',
    content: 'Working on a new React project with Vite. The development experience is so smooth and fast!',
    likes: 89,
    comments: 12,
    shares: 4,
    isLiked: true,
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Coding workspace',
      },
    ],
  },
  {
    id: 3,
    username: 'Carol Davis',
    avatar: 'https://i.pravatar.cc/150?img=3',
    created: '1 day ago',
    content: 'Does anyone have good recommendations for coffee shops in the downtown area? Looking for a good place to work remotely ☕',
    likes: 45,
    comments: 28,
    shares: 2,
    isLiked: false,
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Coffee shop interior',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Coffee and laptop',
      },
    ],
  },
  {
    id: 4,
    username: 'David Lee',
    avatar: 'https://i.pravatar.cc/150?img=4',
    created: '2 days ago',
    content: 'Just launched my new portfolio website! Check it out and let me know what you think. Always open to feedback! 🚀',
    likes: 234,
    comments: 45,
    shares: 15,
    isLiked: true,
  },
  {
    id: 5,
    username: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    created: '3 days ago',
    content: 'Beautiful sunset today. Sometimes we need to slow down and appreciate the little things in life. 🌅',
    likes: 312,
    comments: 18,
    shares: 25,
    isLiked: false,
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Sunset',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/158827/beach-sunset-person-walking-158827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Sunset beach',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Golden hour',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Colorful sunset',
      },
    ],
  },
  {
    id: 6,
    username: 'Frank Martinez',
    avatar: null,
    created: '4 days ago',
    content: 'Anyone else excited for the weekend? Planning to go camping with friends! 🏕️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Camping tent',
      },
    ],
  },
  {
    id: 7,
    username: 'Grace Chen',
    avatar: null,
    created: '5 days ago',
    content: 'Finally finished reading that book I started months ago. Highly recommend "The Midnight Library" by Matt Haig! 📚',
  },
  {
    id: 8,
    username: 'Henry Brown',
    avatar: null,
    created: '5 days ago',
    content: 'Just got back from an incredible food tour in Italy. The pasta was to die for! 🍝🇮🇹',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Italian pasta',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Pizza',
      },
    ],
  },
  {
    id: 9,
    username: 'Isabella Garcia',
    avatar: null,
    created: '6 days ago',
    content: 'Started learning guitar last month and I can finally play my first song! 🎸 Never too late to learn something new.',
  },
  {
    id: 10,
    username: 'Jack Thompson',
    avatar: null,
    created: '1 week ago',
    content: 'Morning run completed! 10km in under an hour. Feeling accomplished! 🏃‍♂️💪',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Running track',
      },
    ],
  },
  {
    id: 11,
    username: 'Karen White',
    avatar: null,
    created: '1 week ago',
    content: 'My garden is finally blooming! All the hard work paid off. 🌺🌻',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1376730/pexels-photo-1376730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Blooming garden',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Flowers',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1687678/pexels-photo-1687678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Garden plants',
      },
    ],
  },
  {
    id: 12,
    username: 'Liam Anderson',
    avatar: null,
    created: '1 week ago',
    content: 'Adopted this little guy from the shelter today. Meet Max! 🐕❤️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Cute puppy',
      },
    ],
  },
  {
    id: 13,
    username: 'Maya Patel',
    avatar: null,
    created: '1 week ago',
    content: 'Spent the day at the beach. The ocean always helps me clear my mind. 🌊',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Beach view',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Ocean waves',
      },
    ],
  },
  {
    id: 14,
    username: 'Noah Rodriguez',
    avatar: null,
    created: '1 week ago',
    content: 'Had the best burger today at this new spot downtown. If you love burgers, you need to check this place out! 🍔',
  },
  {
    id: 15,
    username: 'Olivia Taylor',
    avatar: null,
    created: '2 weeks ago',
    content: 'Just finished my first marathon! Still can\'t believe I did it. Dreams do come true! 🏅',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Marathon runners',
      },
    ],
  },
  {
    id: 16,
    username: 'Paul Walker',
    avatar: null,
    created: '2 weeks ago',
    content: 'Working from home today with this view. Not complaining! 😎',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Home office view',
      },
    ],
  },
  {
    id: 17,
    username: 'Quinn Miller',
    avatar: null,
    created: '2 weeks ago',
    content: 'Anyone else obsessed with houseplants? Just added three more to my collection! 🌿',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Indoor plants',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Plant collection',
      },
    ],
  },
  {
    id: 18,
    username: 'Rachel Green',
    avatar: null,
    created: '2 weeks ago',
    content: 'Throwback to last summer in Greece. Can\'t wait to go back! 🇬🇷',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Santorini',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Greek architecture',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2129796/pexels-photo-2129796.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Greek islands',
      },
    ],
  },
  {
    id: 19,
    username: 'Sam Wilson',
    avatar: null,
    created: '2 weeks ago',
    content: 'Finally upgraded my setup! New monitor, keyboard, and mouse. Productivity level: 100! 💻',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Desk setup',
      },
    ],
  },
  {
    id: 20,
    username: 'Tina Turner',
    avatar: null,
    created: '2 weeks ago',
    content: 'Homemade pizza night! Nothing beats fresh dough and toppings. 🍕👨‍🍳',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Homemade pizza',
      },
    ],
  },
  {
    id: 21,
    username: 'Uma Singh',
    avatar: null,
    created: '3 weeks ago',
    content: 'Started meditating daily and it\'s been a game changer for my mental health. Highly recommend! 🧘‍♀️',
  },
  {
    id: 22,
    username: 'Victor Chang',
    avatar: null,
    created: '3 weeks ago',
    content: 'Caught the most beautiful sunrise this morning. Early mornings really are worth it! 🌄',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Sunrise',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1118874/pexels-photo-1118874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Morning sky',
      },
    ],
  },
  {
    id: 23,
    username: 'Wendy Clark',
    avatar: null,
    created: '3 weeks ago',
    content: 'Just finished redecorating my living room. So happy with how it turned out! 🛋️✨',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Living room',
      },
    ],
  },
  {
    id: 24,
    username: 'Xander Brooks',
    avatar: null,
    created: '3 weeks ago',
    content: 'Concert tonight! So excited to see my favorite band live! 🎵🎸',
  },
  {
    id: 25,
    username: 'Yara Hassan',
    avatar: null,
    created: '3 weeks ago',
    content: 'Tried rock climbing for the first time today. My arms are dead but it was amazing! 🧗‍♀️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2382681/pexels-photo-2382681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Rock climbing wall',
      },
    ],
  },
  {
    id: 26,
    username: 'Zack Morris',
    avatar: null,
    created: '3 weeks ago',
    content: 'New coffee machine arrived! The espresso is incredible ☕❤️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1233528/pexels-photo-1233528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Espresso machine',
      },
    ],
  },
  {
    id: 27,
    username: 'Amy Cooper',
    avatar: null,
    created: '4 weeks ago',
    content: 'Road trip vibes! Heading to the coast for the weekend. 🚗🌊',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1122462/pexels-photo-1122462.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Road trip',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1590549/pexels-photo-1590549.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Highway',
      },
    ],
  },
  {
    id: 28,
    username: 'Ben Parker',
    avatar: null,
    created: '4 weeks ago',
    content: 'Birthday celebration with the crew! Grateful for another year and amazing friends. 🎂🎉',
  },
  {
    id: 29,
    username: 'Chloe Adams',
    avatar: null,
    created: '4 weeks ago',
    content: 'Just baked the most delicious chocolate chip cookies! Recipe link in bio 🍪',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Cookies',
      },
    ],
  },
  {
    id: 30,
    username: 'Derek Scott',
    avatar: null,
    created: '4 weeks ago',
    content: 'Skiing this weekend was epic! The powder was perfect. ⛷️❄️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/848618/pexels-photo-848618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Skiing',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/842433/pexels-photo-842433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Snow mountain',
      },
    ],
  },
  {
    id: 31,
    username: 'Elena Martinez',
    avatar: null,
    created: '1 month ago',
    content: 'First day at my new job! Excited for this new chapter. 💼✨',
  },
  {
    id: 32,
    username: 'Felix Wright',
    avatar: null,
    created: '1 month ago',
    content: 'Sunday brunch done right! Pancakes, bacon, and mimosas. 🥞🥓',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1268549/pexels-photo-1268549.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Brunch',
      },
    ],
  },
  {
    id: 33,
    username: 'Gina Lopez',
    avatar: null,
    created: '1 month ago',
    content: 'Exploring hidden gems in the city. Found this amazing street art! 🎨',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Street art',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Graffiti wall',
      },
    ],
  },
  {
    id: 34,
    username: 'Hugo Silva',
    avatar: null,
    created: '1 month ago',
    content: 'Game night with friends. Board games > video games sometimes! 🎲',
  },
  {
    id: 35,
    username: 'Iris Bennett',
    avatar: null,
    created: '1 month ago',
    content: 'Finally visited that museum I\'ve been meaning to go to. Totally worth it! 🖼️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/2883049/pexels-photo-2883049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Museum interior',
      },
    ],
  },
  {
    id: 36,
    username: 'Jason Reed',
    avatar: null,
    created: '1 month ago',
    content: 'Late night coding session. When inspiration strikes, you just have to go with it! 💻🌙',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Coding at night',
      },
    ],
  },
  {
    id: 37,
    username: 'Kara Stone',
    avatar: null,
    created: '1 month ago',
    content: 'Yoga retreat this weekend was exactly what I needed. Feeling recharged! 🧘‍♀️✨',
  },
  {
    id: 38,
    username: 'Leo Barnes',
    avatar: null,
    created: '1 month ago',
    content: 'Visited a local farmers market. Fresh produce and great vibes! 🥬🍅',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Farmers market',
      },
    ],
  },
  {
    id: 39,
    username: 'Mia Foster',
    avatar: null,
    created: '1 month ago',
    content: 'Stargazing tonight. The universe is incredible! ✨🌌',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1252873/pexels-photo-1252873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Starry night',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Milky way',
      },
    ],
  },
  {
    id: 40,
    username: 'Nathan Cole',
    avatar: null,
    created: '1 month ago',
    content: 'BBQ weekend! Nothing beats grilled food with friends and family. 🍖🔥',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1108775/pexels-photo-1108775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'BBQ grill',
      },
    ],
  },
  {
    id: 41,
    username: 'Olivia Hunt',
    avatar: null,
    created: '5 weeks ago',
    content: 'Finished painting my bedroom. New color, new energy! 🎨',
  },
  {
    id: 42,
    username: 'Patrick Gray',
    avatar: null,
    created: '5 weeks ago',
    content: 'Cycling through the city on this beautiful day. Perfect weather! 🚴‍♂️☀️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Bicycle',
      },
    ],
  },
  {
    id: 43,
    username: 'Quincy James',
    avatar: null,
    created: '5 weeks ago',
    content: 'Adopted a kitten today! Say hello to Luna! 🐱💕',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Cute kitten',
      },
    ],
  },
  {
    id: 44,
    username: 'Rita King',
    avatar: null,
    created: '5 weeks ago',
    content: 'Wine tasting at the vineyard. Learning so much about different varieties! 🍷',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1186116/pexels-photo-1186116.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Wine glasses',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Vineyard',
      },
    ],
  },
  {
    id: 45,
    username: 'Steve Rogers',
    avatar: null,
    created: '5 weeks ago',
    content: 'Training for a triathlon. The journey is tough but worth it! 💪🏊‍♂️🚴‍♂️🏃‍♂️',
  },
  {
    id: 46,
    username: 'Tara Walsh',
    avatar: null,
    created: '6 weeks ago',
    content: 'Took a pottery class and made my first bowl! It\'s wonky but I love it! 🏺',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1139317/pexels-photo-1139317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Pottery',
      },
    ],
  },
  {
    id: 47,
    username: 'Ulysses Grant',
    avatar: null,
    created: '6 weeks ago',
    content: 'Visited the botanical gardens today. Nature therapy at its finest! 🌿🌺',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Botanical garden',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1458618/pexels-photo-1458618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Garden path',
      },
    ],
  },
  {
    id: 48,
    username: 'Vera Cruz',
    avatar: null,
    created: '6 weeks ago',
    content: 'Trying out a new recipe for dinner. Fingers crossed it turns out good! ��‍🍳',
  },
  {
    id: 49,
    username: 'Walter White',
    avatar: null,
    created: '6 weeks ago',
    content: 'Chemistry is fascinating! Just finished a great documentary on molecular biology. 🧪🔬',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Laboratory',
      },
    ],
  },
  {
    id: 50,
    username: 'Xena Prince',
    avatar: null,
    created: '6 weeks ago',
    content: 'Dance class was intense today but so much fun! 💃',
  },
  {
    id: 51,
    username: 'Yasmin Moore',
    avatar: null,
    created: '7 weeks ago',
    content: 'Finished a 1000-piece puzzle! It took me two weeks but I did it! 🧩',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Jigsaw puzzle',
      },
    ],
  },
  {
    id: 52,
    username: 'Zachary Lane',
    avatar: null,
    created: '7 weeks ago',
    content: 'Sunset kayaking is an experience everyone should try at least once! 🛶🌅',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1497582/pexels-photo-1497582.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Kayaking',
      },
    ],
  },
  {
    id: 53,
    username: 'Amanda Perry',
    avatar: null,
    created: '7 weeks ago',
    content: 'New haircut, who dis? ✂️💇‍♀️',
  },
  {
    id: 54,
    username: 'Brandon Hill',
    avatar: null,
    created: '7 weeks ago',
    content: 'Volunteering at the animal shelter has been so rewarding. These animals deserve all the love! 🐕🐈❤️',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Dog at shelter',
      },
    ],
  },
  {
    id: 55,
    username: 'Carmen Diaz',
    avatar: null,
    created: '8 weeks ago',
    content: 'Photography walk around the city. Captured some amazing moments! 📸',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Urban photography',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'City street',
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        alt: 'Architecture',
      },
    ],
  },
];

const ensurePostHasEngagementMetrics = (post) => {
  if (post.likes !== undefined) return post;

  return {
    ...post,
    avatar: post.avatar || `https://i.pravatar.cc/150?img=${post.id % 70}`,
    likes: Math.floor(Math.random() * 300) + 10,
    comments: Math.floor(Math.random() * 50) + 1,
    shares: Math.floor(Math.random() * 20),
    isLiked: Math.random() > 0.7,
  };
};

mockPosts = mockPosts.map(ensurePostHasEngagementMetrics);

export const getPosts = (page = 1, pageSize = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedPosts = mockPosts.slice(start, end);

      resolve({
        data: paginatedPosts,
        totalPages: Math.ceil(mockPosts.length / pageSize),
        currentPage: page,
        total: mockPosts.length,
      });
    }, 300);
  });
};

export const createPost = (postData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        username: 'demo_user',
        avatar: 'https://i.pravatar.cc/150?u=demo',
        created: 'Just now',
        content: typeof postData === 'string' ? postData : postData.content,
        media: postData.media || [],
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
      };
      mockPosts = [newPost, ...mockPosts];
      resolve(newPost);
    }, 400);
  });
};

export const updatePost = (id, content) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPosts = mockPosts.map(post => 
        post.id === id ? { ...post, content } : post
      );
      const updatedPost = mockPosts.find(post => post.id === id);
      resolve(updatedPost);
    }, 300);
  });
};

export const deletePost = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPosts = mockPosts.filter(post => post.id !== id);
      resolve({ success: true });
    }, 300);
  });
};

export const mockFriends = [
  { id: 1, name: 'Sarah Connor', status: 'online', avatar: null },
  { id: 2, name: 'John Doe', status: 'offline', avatar: null },
  { id: 3, name: 'Jane Smith', status: 'online', avatar: null },
  { id: 4, name: 'Mike Johnson', status: 'away', avatar: null },
];

export const mockGroups = [
  { id: 1, name: 'React Developers', members: 1234, cover: null },
  { id: 2, name: 'Web Design', members: 567, cover: null },
  { id: 3, name: 'Tech Enthusiasts', members: 890, cover: null },
];
