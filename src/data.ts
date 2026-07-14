/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ItineraryItem, Table, GuestbookMessage, PhotoAsset } from "./types";

export const WEDDING_DATE = new Date("2026-08-01T19:00:00");

export const ITINERARY_DATA: ItineraryItem[] = [
  {
    id: "iti-1",
    time: "19:00",
    title: "La Ceremonia Religiosa",
    description: "Unión sagrada en la Parroquia Sagrado Corazón de Jesús. Se solicita puntualidad.",
    iconName: "Church",
  },
  {
    id: "iti-2",
    time: "20:00",
    title: "La Recepción",
    description: "Bienvenida y cóctel de honor en la Casona del Prado, celebrando el inicio de esta velada.",
    iconName: "GlassWater",
  },
  {
    id: "iti-3",
    time: "20:45",
    title: "Entrada de los Novios",
    description: "Recepción oficial de Kimberly y Jhon, celebrando el inicio de la fiesta.",
    iconName: "Sparkles",
  },
  {
    id: "iti-4",
    time: "21:15",
    title: "Banquete de Gala",
    description: "Una cena de gala exquisita seleccionada especialmente para compartir con ustedes.",
    iconName: "Utensils",
  },
  {
    id: "iti-5",
    time: "22:15",
    title: "El Primer Baile",
    description: "Kimberly y Jhon abrirán la pista de baile bajo una atmósfera mágica.",
    iconName: "Music",
  },
  {
    id: "iti-6",
    time: "22:45",
    title: "Fiesta y Celebración",
    description: "Música de DJ de gala, sorpresas y la mejor energía para festejar juntos.",
    iconName: "PartyPopper",
  },
  {
    id: "iti-7",
    time: "02:00",
    title: "Brindis de Cierre",
    description: "Agradecimientos y despedida solemne cerrando esta noche inolvidable.",
    iconName: "HeartHandshake",
  },
];

export const TABLES_DATA: Table[] = [
  {
    id: "t-1",
    number: 1,
    name: "Mesa Imperial de Honor",
    description: "Mesa presidencial de los novios y padres",
    guests: [
      "Kimberly Figueroa Barreto",
      "Jhon Jairo",
      "Carmen Barreto de Figueroa",
      "Carlos Figueroa",
      "Luz Marina de Jhon",
      "Jhon Jairo Padre",
    ],
  },
  {
    id: "t-2",
    number: 2,
    name: "Familia Figueroa - Barreto",
    description: "Familia de la Novia",
    guests: [
      "Alejandra Figueroa Barreto",
      "Mauricio Figueroa",
      "Beatriz Barreto",
      "Andrés Barreto",
      "Gloria Figueroa",
      "Diana Carolina Figueroa",
      "Santiago Figueroa",
      "Valentina Barreto",
    ],
  },
  {
    id: "t-3",
    number: 3,
    name: "Familia Jhon - Marina",
    description: "Familia del Novio",
    guests: [
      "Guillermo Jhon",
      "Estela Marina",
      "Mateo Jhon",
      "Laura Jhon",
      "Sofia Jhon",
      "Clara Marina",
      "Roberto Marina",
      "Daniela Jhon",
    ],
  },
  {
    id: "t-4",
    number: 4,
    name: "Corte de Honor & Damas",
    description: "Damas de Honor y Best Men",
    guests: [
      "Mariana Gómez",
      "Daniela Ortiz",
      "Camilo Vargas",
      "Sebastian Ruiz",
      "Isabella Restrepo",
      "Felipe Mendoza",
      "Camila Londoño",
      "Juan Sebastián Pérez",
    ],
  },
  {
    id: "t-5",
    number: 5,
    name: "Mesa Champagne - Amigos Cercanos",
    description: "Amigos de la universidad y de toda la vida",
    guests: [
      "Ricardo Silva",
      "Andrea Castro",
      "Paula Beltrán",
      "Fernando Torres",
      "Carolina Méndez",
      "Santiago Bedoya",
      "Valeria Espitia",
      "Jorge Mario González",
    ],
  },
  {
    id: "t-6",
    number: 6,
    name: "Mesa Olivo - Compañeros de Éxito",
    description: "Amigos de trabajo y proyectos",
    guests: [
      "Martha Ligia Ramírez",
      "Gabriel Jaime Restrepo",
      "Carlos Mario Holguín",
      "Liliana Patricia Estrada",
      "Héctor Fabio Gallego",
      "María Mercedes Giraldo",
      "Juan Fernando Hoyos",
      "Clara Inés Ochoa",
    ],
  },
];

export const INITIAL_MESSAGES: GuestbookMessage[] = [
  {
    id: "msg-1",
    author: "Alejandra Figueroa",
    message: "¡No puedo expresar lo feliz que estoy por ustedes! Verlos dar este paso me llena el corazón de amor. Les deseo una eternidad de risas, comprensión y aventuras juntos. ¡Los amo con el alma!",
    timestamp: "14 de Julio, 2026",
    heartCount: 12,
  },
  {
    id: "msg-2",
    author: "Camilo Vargas",
    message: "¡La mejor boda del año! Jhon, mi hermano, te llevas a una mujer espectacular y sé que juntos construirán un hogar maravilloso. Cuenta conmigo siempre. ¡A celebrar este 1 de agosto como se debe!",
    timestamp: "14 de Julio, 2026",
    heartCount: 8,
  },
  {
    id: "msg-3",
    author: "Tía Beatriz",
    message: "Que Dios guíe siempre su camino. El matrimonio es un jardín que se riega todos los días con amor, paciencia y mucho respeto. Felicitaciones Kimberly y Jhon Jairo, los queremos muchísimo.",
    timestamp: "13 de Julio, 2026",
    heartCount: 15,
  },
];

export const INITIAL_PHOTOS: PhotoAsset[] = [
  {
    id: "photo-1",
    url: "https://picsum.photos/seed/wedding-love1/800/600",
    author: "Kimberly & Jhon",
    caption: "El día que dijimos 'Sí' a esta gran aventura. Sesión pre-boda en el atardecer.",
    timestamp: "Junio 2026",
    likes: 42,
  },
  {
    id: "photo-2",
    url: "https://picsum.photos/seed/wedding-love2/800/1000",
    author: "Alejandra F.",
    caption: "Recordando el día del compromiso. ¡Momento inolvidable!",
    timestamp: "Enero 2026",
    likes: 28,
  },
  {
    id: "photo-3",
    url: "https://picsum.photos/seed/wedding-love3/800/600",
    author: "Jhon Jairo",
    caption: "Nuestra primera foto juntos hace unos años. El inicio de todo.",
    timestamp: "Octubre 2021",
    likes: 37,
  },
  {
    id: "photo-4",
    url: "https://picsum.photos/seed/wedding-love4/600/800",
    author: "Kimberly",
    caption: "Detalles del gran anuncio. ¡Nos Casamos!",
    timestamp: "Febrero 2026",
    likes: 31,
  },
];

export const GIFT_REGISTRY_CHANNELS = {
  bank: {
    bankName: "Bancolombia",
    accountType: "Cuenta de Ahorros",
    accountNumber: "245-098765-12",
    titular: "Kimberly Figueroa Barreto / Jhon Jairo",
    document: "C.C. 1.020.456.789",
    giftEnvelopeNote: "Lluvia de Sobres: Si deseas apoyarnos de forma física, contaremos con un cofre de sobres el día de la recepción.",
  },
  wishlist: [
    {
      id: "w-1",
      name: "Juego de Vajilla de Cerámica Artesanal (16 Piezas)",
      price: "$180 USD",
      reserved: false,
      store: "Cartier Home / Zara Home",
    },
    {
      id: "w-2",
      name: "Cafetera Espresso Premium Barista",
      price: "$350 USD",
      reserved: true,
      store: "Amazon",
    },
    {
      id: "w-3",
      name: "Juego de Maletas de Viaje para Luna de Miel",
      price: "$220 USD",
      reserved: false,
      store: "Samsonite",
    },
    {
      id: "w-4",
      name: "Cámara Instantánea con Álbum de Cuero",
      price: "$120 USD",
      reserved: false,
      store: "FujiFilm Store",
    },
    {
      id: "w-5",
      name: "Set de Copas de Cristal de Champagne (6 pzs)",
      price: "$95 USD",
      reserved: false,
      store: "Home Design",
    },
  ],
};
