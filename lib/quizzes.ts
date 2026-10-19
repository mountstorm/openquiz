import type { Quiz } from './game';
export const quizzes: (Quiz & { category:string; color:string; icon:string; description:string })[] = [
 { title:'The curious minds quiz',category:'GENERAL KNOWLEDGE',color:'lilac',icon:'✳',description:'A little science, a little world, a lot of “I knew that!”',questions:[
 {text:'Which planet has the most prominent ring system?',options:['Mars','Saturn','Venus','Mercury'],correct:1,seconds:20},
 {text:'How many hearts does an octopus have?',options:['One','Two','Three','Four'],correct:2,seconds:20},
 {text:'Which country is home to the city of Kyoto?',options:['Japan','Thailand','South Korea','Vietnam'],correct:0,seconds:20},
 {text:'What is the largest ocean on Earth?',options:['Atlantic','Indian','Arctic','Pacific'],correct:3,seconds:20},
 {text:'What does a light-year measure?',options:['Time','Distance','Brightness','Temperature'],correct:1,seconds:20}]},
 {title:'Around the world',category:'GEOGRAPHY',color:'peach',icon:'◎',description:'Five questions. One planet. How far will you go?',questions:[
 {text:'Which continent is the Sahara Desert in?',options:['Asia','Africa','Australia','Europe'],correct:1,seconds:20},
 {text:'What is the capital of Canada?',options:['Toronto','Vancouver','Ottawa','Montreal'],correct:2,seconds:20},
 {text:'Which country has the city of Barcelona?',options:['Portugal','Italy','France','Spain'],correct:3,seconds:20},
 {text:'Which is the largest country by land area?',options:['Canada','China','Russia','Brazil'],correct:2,seconds:20},
 {text:'The Andes mountains are in which continent?',options:['South America','Europe','Africa','North America'],correct:0,seconds:20}]},
 {title:'Science, but make it fun',category:'SCIENCE & NATURE',color:'mint',icon:'⚗',description:'Small discoveries. Big “aha!” moments.',questions:[
 {text:'What gas do plants absorb during photosynthesis?',options:['Oxygen','Helium','Carbon dioxide','Hydrogen'],correct:2,seconds:20},
 {text:'What is the chemical symbol for gold?',options:['Ag','Au','Gd','Go'],correct:1,seconds:20},
 {text:'Which organ pumps blood around your body?',options:['Liver','Lungs','Brain','Heart'],correct:3,seconds:20},
 {text:'At sea level, water freezes at what temperature?',options:['0°C','10°C','32°C','100°C'],correct:0,seconds:20},
 {text:'Which of these animals is a mammal?',options:['Shark','Dolphin','Trout','Octopus'],correct:1,seconds:20}]}
];
