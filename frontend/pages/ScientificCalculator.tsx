import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Calculator, TrendingUp, FlaskConical, Atom, Zap, Scale, X, RotateCcw, ArrowLeftRight, Plus, Trash2, Camera, Circle, Binary, Sigma, ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

type Mode = 'calc' | 'graph' | 'units' | 'chemistry' | 'physics';
type CalcSubMode = 'std' | 'proba' | 'complex' | 'equation';
type ChemSubMode = 'table' | 'molar';

// --- DATA: PERIODIC TABLE (Complete 118 Elements) ---
const ELEMENTS = [
    // Period 1
    { n: 1, s: 'H', name: 'Hydrogène', mass: 1.008, cat: 'nonmetal', col: 1, row: 1 },
    { n: 2, s: 'He', name: 'Hélium', mass: 4.0026, cat: 'noble', col: 18, row: 1 },

    // Period 2
    { n: 3, s: 'Li', name: 'Lithium', mass: 6.94, cat: 'alkali', col: 1, row: 2 },
    { n: 4, s: 'Be', name: 'Béryllium', mass: 9.0122, cat: 'alkaline', col: 2, row: 2 },
    { n: 5, s: 'B', name: 'Bore', mass: 10.81, cat: 'metalloid', col: 13, row: 2 },
    { n: 6, s: 'C', name: 'Carbone', mass: 12.011, cat: 'nonmetal', col: 14, row: 2 },
    { n: 7, s: 'N', name: 'Azote', mass: 14.007, cat: 'nonmetal', col: 15, row: 2 },
    { n: 8, s: 'O', name: 'Oxygène', mass: 15.999, cat: 'nonmetal', col: 16, row: 2 },
    { n: 9, s: 'F', name: 'Fluor', mass: 18.998, cat: 'halogen', col: 17, row: 2 },
    { n: 10, s: 'Ne', name: 'Néon', mass: 20.180, cat: 'noble', col: 18, row: 2 },

    // Period 3
    { n: 11, s: 'Na', name: 'Sodium', mass: 22.990, cat: 'alkali', col: 1, row: 3 },
    { n: 12, s: 'Mg', name: 'Magnésium', mass: 24.305, cat: 'alkaline', col: 2, row: 3 },
    { n: 13, s: 'Al', name: 'Aluminium', mass: 26.982, cat: 'post-transition', col: 13, row: 3 },
    { n: 14, s: 'Si', name: 'Silicium', mass: 28.085, cat: 'metalloid', col: 14, row: 3 },
    { n: 15, s: 'P', name: 'Phosphore', mass: 30.974, cat: 'nonmetal', col: 15, row: 3 },
    { n: 16, s: 'S', name: 'Soufre', mass: 32.06, cat: 'nonmetal', col: 16, row: 3 },
    { n: 17, s: 'Cl', name: 'Chlore', mass: 35.45, cat: 'halogen', col: 17, row: 3 },
    { n: 18, s: 'Ar', name: 'Argon', mass: 39.948, cat: 'noble', col: 18, row: 3 },

    // Period 4
    { n: 19, s: 'K', name: 'Potassium', mass: 39.098, cat: 'alkali', col: 1, row: 4 },
    { n: 20, s: 'Ca', name: 'Calcium', mass: 40.078, cat: 'alkaline', col: 2, row: 4 },
    { n: 21, s: 'Sc', name: 'Scandium', mass: 44.956, cat: 'transition', col: 3, row: 4 },
    { n: 22, s: 'Ti', name: 'Titane', mass: 47.867, cat: 'transition', col: 4, row: 4 },
    { n: 23, s: 'V', name: 'Vanadium', mass: 50.942, cat: 'transition', col: 5, row: 4 },
    { n: 24, s: 'Cr', name: 'Chrome', mass: 51.996, cat: 'transition', col: 6, row: 4 },
    { n: 25, s: 'Mn', name: 'Manganèse', mass: 54.938, cat: 'transition', col: 7, row: 4 },
    { n: 26, s: 'Fe', name: 'Fer', mass: 55.845, cat: 'transition', col: 8, row: 4 },
    { n: 27, s: 'Co', name: 'Cobalt', mass: 58.933, cat: 'transition', col: 9, row: 4 },
    { n: 28, s: 'Ni', name: 'Nickel', mass: 58.693, cat: 'transition', col: 10, row: 4 },
    { n: 29, s: 'Cu', name: 'Cuivre', mass: 63.546, cat: 'transition', col: 11, row: 4 },
    { n: 30, s: 'Zn', name: 'Zinc', mass: 65.38, cat: 'transition', col: 12, row: 4 },
    { n: 31, s: 'Ga', name: 'Gallium', mass: 69.723, cat: 'post-transition', col: 13, row: 4 },
    { n: 32, s: 'Ge', name: 'Germanium', mass: 72.63, cat: 'metalloid', col: 14, row: 4 },
    { n: 33, s: 'As', name: 'Arsenic', mass: 74.922, cat: 'metalloid', col: 15, row: 4 },
    { n: 34, s: 'Se', name: 'Sélénium', mass: 78.96, cat: 'nonmetal', col: 16, row: 4 },
    { n: 35, s: 'Br', name: 'Brome', mass: 79.904, cat: 'halogen', col: 17, row: 4 },
    { n: 36, s: 'Kr', name: 'Krypton', mass: 83.798, cat: 'noble', col: 18, row: 4 },

    // Period 5
    { n: 37, s: 'Rb', name: 'Rubidium', mass: 85.468, cat: 'alkali', col: 1, row: 5 },
    { n: 38, s: 'Sr', name: 'Strontium', mass: 87.62, cat: 'alkaline', col: 2, row: 5 },
    { n: 39, s: 'Y', name: 'Yttrium', mass: 88.906, cat: 'transition', col: 3, row: 5 },
    { n: 40, s: 'Zr', name: 'Zirconium', mass: 91.224, cat: 'transition', col: 4, row: 5 },
    { n: 41, s: 'Nb', name: 'Niobium', mass: 92.906, cat: 'transition', col: 5, row: 5 },
    { n: 42, s: 'Mo', name: 'Molybdène', mass: 95.95, cat: 'transition', col: 6, row: 5 },
    { n: 43, s: 'Tc', name: 'Technétium', mass: 98, cat: 'transition', col: 7, row: 5 },
    { n: 44, s: 'Ru', name: 'Ruthénium', mass: 101.07, cat: 'transition', col: 8, row: 5 },
    { n: 45, s: 'Rh', name: 'Rhodium', mass: 102.91, cat: 'transition', col: 9, row: 5 },
    { n: 46, s: 'Pd', name: 'Palladium', mass: 106.42, cat: 'transition', col: 10, row: 5 },
    { n: 47, s: 'Ag', name: 'Argent', mass: 107.87, cat: 'transition', col: 11, row: 5 },
    { n: 48, s: 'Cd', name: 'Cadmium', mass: 112.41, cat: 'transition', col: 12, row: 5 },
    { n: 49, s: 'In', name: 'Indium', mass: 114.82, cat: 'post-transition', col: 13, row: 5 },
    { n: 50, s: 'Sn', name: 'Étain', mass: 118.71, cat: 'post-transition', col: 14, row: 5 },
    { n: 51, s: 'Sb', name: 'Antimoine', mass: 121.76, cat: 'metalloid', col: 15, row: 5 },
    { n: 52, s: 'Te', name: 'Tellure', mass: 127.60, cat: 'metalloid', col: 16, row: 5 },
    { n: 53, s: 'I', name: 'Iode', mass: 126.90, cat: 'halogen', col: 17, row: 5 },
    { n: 54, s: 'Xe', name: 'Xénon', mass: 131.29, cat: 'noble', col: 18, row: 5 },

    // Period 6
    { n: 55, s: 'Cs', name: 'Césium', mass: 132.91, cat: 'alkali', col: 1, row: 6 },
    { n: 56, s: 'Ba', name: 'Baryum', mass: 137.33, cat: 'alkaline', col: 2, row: 6 },
    // Lanthanides (57-71) are below
    { n: 72, s: 'Hf', name: 'Hafnium', mass: 178.49, cat: 'transition', col: 4, row: 6 },
    { n: 73, s: 'Ta', name: 'Tantale', mass: 180.95, cat: 'transition', col: 5, row: 6 },
    { n: 74, s: 'W', name: 'Tungstène', mass: 183.84, cat: 'transition', col: 6, row: 6 },
    { n: 75, s: 'Re', name: 'Rhénium', mass: 186.21, cat: 'transition', col: 7, row: 6 },
    { n: 76, s: 'Os', name: 'Osmium', mass: 190.23, cat: 'transition', col: 8, row: 6 },
    { n: 77, s: 'Ir', name: 'Iridium', mass: 192.22, cat: 'transition', col: 9, row: 6 },
    { n: 78, s: 'Pt', name: 'Platine', mass: 195.08, cat: 'transition', col: 10, row: 6 },
    { n: 79, s: 'Au', name: 'Or', mass: 196.97, cat: 'transition', col: 11, row: 6 },
    { n: 80, s: 'Hg', name: 'Mercure', mass: 200.59, cat: 'transition', col: 12, row: 6 },
    { n: 81, s: 'Tl', name: 'Thallium', mass: 204.38, cat: 'post-transition', col: 13, row: 6 },
    { n: 82, s: 'Pb', name: 'Plomb', mass: 207.2, cat: 'post-transition', col: 14, row: 6 },
    { n: 83, s: 'Bi', name: 'Bismuth', mass: 208.98, cat: 'post-transition', col: 15, row: 6 },
    { n: 84, s: 'Po', name: 'Polonium', mass: 209, cat: 'metalloid', col: 16, row: 6 },
    { n: 85, s: 'At', name: 'Astate', mass: 210, cat: 'halogen', col: 17, row: 6 },
    { n: 86, s: 'Rn', name: 'Radon', mass: 222, cat: 'noble', col: 18, row: 6 },

    // Period 7
    { n: 87, s: 'Fr', name: 'Francium', mass: 223, cat: 'alkali', col: 1, row: 7 },
    { n: 88, s: 'Ra', name: 'Radium', mass: 226, cat: 'alkaline', col: 2, row: 7 },
    // Actinides (89-103) are below
    { n: 104, s: 'Rf', name: 'Rutherfordium', mass: 267, cat: 'transition', col: 4, row: 7 },
    { n: 105, s: 'Db', name: 'Dubnium', mass: 268, cat: 'transition', col: 5, row: 7 },
    { n: 106, s: 'Sg', name: 'Seaborgium', mass: 269, cat: 'transition', col: 6, row: 7 },
    { n: 107, s: 'Bh', name: 'Bohrium', mass: 270, cat: 'transition', col: 7, row: 7 },
    { n: 108, s: 'Hs', name: 'Hassium', mass: 269, cat: 'transition', col: 8, row: 7 },
    { n: 109, s: 'Mt', name: 'Meitnerium', mass: 278, cat: 'transition', col: 9, row: 7 },
    { n: 110, s: 'Ds', name: 'Darmstadtium', mass: 281, cat: 'transition', col: 10, row: 7 },
    { n: 111, s: 'Rg', name: 'Roentgenium', mass: 282, cat: 'transition', col: 11, row: 7 },
    { n: 112, s: 'Cn', name: 'Copernicium', mass: 285, cat: 'transition', col: 12, row: 7 },
    { n: 113, s: 'Nh', name: 'Nihonium', mass: 286, cat: 'post-transition', col: 13, row: 7 },
    { n: 114, s: 'Fl', name: 'Flerovium', mass: 289, cat: 'post-transition', col: 14, row: 7 },
    { n: 115, s: 'Mc', name: 'Moscovium', mass: 290, cat: 'post-transition', col: 15, row: 7 },
    { n: 116, s: 'Lv', name: 'Livermorium', mass: 293, cat: 'post-transition', col: 16, row: 7 },
    { n: 117, s: 'Ts', name: 'Tennessine', mass: 294, cat: 'halogen', col: 17, row: 7 },
    { n: 118, s: 'Og', name: 'Oganesson', mass: 294, cat: 'noble', col: 18, row: 7 },

    // Lanthanides (Row 9 visually)
    { n: 57, s: 'La', name: 'Lanthane', mass: 138.91, cat: 'lanthanide', col: 4, row: 9 },
    { n: 58, s: 'Ce', name: 'Cérium', mass: 140.12, cat: 'lanthanide', col: 5, row: 9 },
    { n: 59, s: 'Pr', name: 'Praséodyme', mass: 140.91, cat: 'lanthanide', col: 6, row: 9 },
    { n: 60, s: 'Nd', name: 'Néodyme', mass: 144.24, cat: 'lanthanide', col: 7, row: 9 },
    { n: 61, s: 'Pm', name: 'Prométhium', mass: 145, cat: 'lanthanide', col: 8, row: 9 },
    { n: 62, s: 'Sm', name: 'Samarium', mass: 150.36, cat: 'lanthanide', col: 9, row: 9 },
    { n: 63, s: 'Eu', name: 'Europium', mass: 151.96, cat: 'lanthanide', col: 10, row: 9 },
    { n: 64, s: 'Gd', name: 'Gadolinium', mass: 157.25, cat: 'lanthanide', col: 11, row: 9 },
    { n: 65, s: 'Tb', name: 'Terbium', mass: 158.93, cat: 'lanthanide', col: 12, row: 9 },
    { n: 66, s: 'Dy', name: 'Dysprosium', mass: 162.50, cat: 'lanthanide', col: 13, row: 9 },
    { n: 67, s: 'Ho', name: 'Holmium', mass: 164.93, cat: 'lanthanide', col: 14, row: 9 },
    { n: 68, s: 'Er', name: 'Erbium', mass: 167.26, cat: 'lanthanide', col: 15, row: 9 },
    { n: 69, s: 'Tm', name: 'Thulium', mass: 168.93, cat: 'lanthanide', col: 16, row: 9 },
    { n: 70, s: 'Yb', name: 'Ytterbium', mass: 173.05, cat: 'lanthanide', col: 17, row: 9 },
    { n: 71, s: 'Lu', name: 'Lutécium', mass: 174.97, cat: 'lanthanide', col: 18, row: 9 },

    // Actinides (Row 10 visually)
    { n: 89, s: 'Ac', name: 'Actinium', mass: 227, cat: 'actinide', col: 4, row: 10 },
    { n: 90, s: 'Th', name: 'Thorium', mass: 232.04, cat: 'actinide', col: 5, row: 10 },
    { n: 91, s: 'Pa', name: 'Protactinium', mass: 231.04, cat: 'actinide', col: 6, row: 10 },
    { n: 92, s: 'U', name: 'Uranium', mass: 238.03, cat: 'actinide', col: 7, row: 10 },
    { n: 93, s: 'Np', name: 'Neptunium', mass: 237, cat: 'actinide', col: 8, row: 10 },
    { n: 94, s: 'Pu', name: 'Plutonium', mass: 244, cat: 'actinide', col: 9, row: 10 },
    { n: 95, s: 'Am', name: 'Américium', mass: 243, cat: 'actinide', col: 10, row: 10 },
    { n: 96, s: 'Cm', name: 'Curium', mass: 247, cat: 'actinide', col: 11, row: 10 },
    { n: 97, s: 'Bk', name: 'Berkélium', mass: 247, cat: 'actinide', col: 12, row: 10 },
    { n: 98, s: 'Cf', name: 'Californium', mass: 251, cat: 'actinide', col: 13, row: 10 },
    { n: 99, s: 'Es', name: 'Einsteinium', mass: 252, cat: 'actinide', col: 14, row: 10 },
    { n: 100, s: 'Fm', name: 'Fermium', mass: 257, cat: 'actinide', col: 15, row: 10 },
    { n: 101, s: 'Md', name: 'Mendélévium', mass: 258, cat: 'actinide', col: 16, row: 10 },
    { n: 102, s: 'No', name: 'Nobélium', mass: 259, cat: 'actinide', col: 17, row: 10 },
    { n: 103, s: 'Lr', name: 'Lawrencium', mass: 266, cat: 'actinide', col: 18, row: 10 },
];

const CATEGORY_COLORS: Record<string, string> = {
    nonmetal: 'bg-green-200 text-green-900 border-green-400',
    noble: 'bg-purple-200 text-purple-900 border-purple-400',
    alkali: 'bg-red-200 text-red-900 border-red-400',
    alkaline: 'bg-orange-200 text-orange-900 border-orange-400',
    metalloid: 'bg-teal-200 text-teal-900 border-teal-400',
    halogen: 'bg-yellow-200 text-yellow-900 border-yellow-400',
    'post-transition': 'bg-blue-200 text-blue-900 border-blue-400',
    transition: 'bg-pink-200 text-pink-900 border-pink-400',
    lanthanide: 'bg-indigo-200 text-indigo-900 border-indigo-400',
    actinide: 'bg-gray-300 text-gray-900 border-gray-500'
};

// --- DATA: UNIT CONVERSION ---
const UNIT_CATEGORIES: Record<string, { name: string, units: Record<string, number> }> = {
    length: {
        name: 'Longueur',
        units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, 'µm': 1e-6, nm: 1e-9, in: 0.0254, ft: 0.3048, mi: 1609.34 }
    },
    mass: {
        name: 'Masse',
        units: { kg: 1, g: 0.001, mg: 1e-6, 'µg': 1e-9, t: 1000, lb: 0.453592, oz: 0.0283495 }
    },
    time: {
        name: 'Temps',
        units: { s: 1, ms: 0.001, min: 60, h: 3600, d: 86400, y: 31536000 }
    },
    energy: {
        name: 'Énergie',
        units: { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6, eV: 1.602e-19 }
    },
    power: {
        name: 'Puissance',
        units: { W: 1, kW: 1000, MW: 1e6, hp: 745.7 }
    },
    current: {
        name: 'Courant Elec.',
        units: { A: 1, mA: 0.001, 'µA': 1e-6, kA: 1000 }
    },
    resistance: {
        name: 'Résistance',
        units: { 'Ω': 1, 'mΩ': 0.001, 'kΩ': 1000, 'MΩ': 1e6 }
    },
    voltage: {
        name: 'Tension',
        units: { V: 1, mV: 0.001, kV: 1000, MV: 1e6 }
    },
    pressure: {
        name: 'Pression',
        units: { Pa: 1, hPa: 100, kPa: 1000, bar: 1e5, atm: 101325, psi: 6894.76 }
    },
    force: {
        name: 'Force',
        units: { N: 1, kN: 1000, dyn: 1e-5, lbf: 4.448 }
    },
    data: {
        name: 'Données',
        units: { bit: 0.125, octet: 1, Ko: 1024, Mo: 1048576, Go: 1073741824, To: 1099511627776 }
    }
};

// --- UTILS ---
const getElementDescription = (el: any) => {
    switch (el.cat) {
        case 'noble': return "Gaz noble : inerte, inodore et incolore. Ne réagit que très rarement.";
        case 'alkali': return "Métal alcalin : mou, très réactif et argenté. Explose au contact de l'eau.";
        case 'alkaline': return "Métal alcalino-terreux : brillant et réactif à température ambiante.";
        case 'transition': return "Métal de transition : dur, bon conducteur d'électricité et de chaleur.";
        case 'metalloid': return "Métalloïde : possède des propriétés intermédiaires entre métaux et non-métaux.";
        case 'halogen': return "Halogène : non-métal très réactif, forme des sels avec les métaux.";
        case 'nonmetal': return "Non-métal : isolant thermique/électrique, essentiel à la vie organique.";
        case 'lanthanide': return "Lanthanide : métal terreux rare, utilisé dans les lasers et aimants.";
        case 'actinide': return "Actinide : métal lourd radioactif, instable.";
        default: return "Élément chimique.";
    }
};

// Complex Number Helper
class Complex {
    constructor(public r: number, public i: number) { }
    add(o: Complex) { return new Complex(this.r + o.r, this.i + o.i); }
    sub(o: Complex) { return new Complex(this.r - o.r, this.i - o.i); }
    mul(o: Complex) { return new Complex(this.r * o.r - this.i * o.i, this.r * o.i + this.i * o.r); }
    div(o: Complex) {
        const d = o.r * o.r + o.i * o.i;
        return new Complex((this.r * o.r + this.i * o.i) / d, (this.i * o.r - this.r * o.i) / d);
    }
    toString() {
        const real = this.r;
        const imag = this.i;
        if (imag === 0) return real.toFixed(2);
        if (real === 0) return `${imag.toFixed(2)}i`;
        return `${real.toFixed(2)} ${imag >= 0 ? '+' : '-'} ${Math.abs(imag).toFixed(2)}i`;
    }
    toPolar() {
        const r = Math.sqrt(this.r * this.r + this.i * this.i);
        const theta = Math.atan2(this.i, this.r) * (180 / Math.PI);
        return `r=${r.toFixed(2)}, θ=${theta.toFixed(2)}°`;
    }
}

const PHYSICS_FORMULAS = [
    {
        id: 'ohm',
        name: 'Loi d\'Ohm (U = R.I)',
        description: "Calcule la tension (U), l'intensité (I) ou la résistance (R) dans un circuit électrique. Fondamental pour l'électronique.",
        inputs: [
            { id: 'r', label: 'Résistance (Ω)', val: '' },
            { id: 'i', label: 'Intensité (A)', val: '' }
        ],
        calc: (vals: any) => vals.r * vals.i,
        unit: 'Volts (V)'
    },
    {
        id: 'force',
        name: 'Force (F = m.a)',
        description: "2ème loi de Newton. Relie la force appliquée à la masse et l'accélération d'un objet.",
        inputs: [
            { id: 'm', label: 'Masse (kg)', val: '' },
            { id: 'a', label: 'Accélération (m/s²)', val: '' }
        ],
        calc: (vals: any) => vals.m * vals.a,
        unit: 'Newtons (N)'
    },
    {
        id: 'work',
        name: 'Travail (W = F.d)',
        description: "Mesure l'énergie transférée lorsqu'une force déplace un objet sur une distance donnée.",
        inputs: [
            { id: 'f', label: 'Force (N)', val: '' },
            { id: 'd', label: 'Distance (m)', val: '' }
        ],
        calc: (vals: any) => vals.f * vals.d,
        unit: 'Joules (J)'
    },
    {
        id: 'power',
        name: 'Puissance (P = W/t)',
        description: "Détermine la rapidité avec laquelle un travail est effectué ou l'énergie est transférée.",
        inputs: [
            { id: 'w', label: 'Travail (J)', val: '' },
            { id: 't', label: 'Temps (s)', val: '' }
        ],
        calc: (vals: any) => vals.w / vals.t,
        unit: 'Watts (W)'
    },
    {
        id: 'kinetic',
        name: 'Énergie Cinétique (Ec = ½ mv²)',
        description: "L'énergie qu'un objet possède en raison de son mouvement. Dépend de la masse et de la vitesse.",
        inputs: [
            { id: 'm', label: 'Masse (kg)', val: '' },
            { id: 'v', label: 'Vitesse (m/s)', val: '' }
        ],
        calc: (vals: any) => 0.5 * vals.m * Math.pow(vals.v, 2),
        unit: 'Joules (J)'
    },
    {
        id: 'potential',
        name: 'Énergie Potentielle (Ep = m.g.h)',
        description: "L'énergie stockée par un objet en raison de sa hauteur dans un champ gravitationnel.",
        inputs: [
            { id: 'm', label: 'Masse (kg)', val: '' },
            { id: 'h', label: 'Hauteur (m)', val: '' },
            { id: 'g', label: 'Gravité (m/s²)', val: '9.81' }
        ],
        calc: (vals: any) => vals.m * vals.g * vals.h,
        unit: 'Joules (J)'
    },
    {
        id: 'thermo1',
        name: '1ère Loi Thermo (ΔU = Q - W)',
        description: "Principe de conservation de l'énergie : la variation d'énergie interne est égale à la chaleur reçue moins le travail fourni.",
        inputs: [
            { id: 'q', label: 'Chaleur (J)', val: '' },
            { id: 'w', label: 'Travail (J)', val: '' }
        ],
        calc: (vals: any) => vals.q - vals.w,
        unit: 'Joules (J)'
    },
    {
        id: 'ideal_gas',
        name: 'Gaz Parfaits (P = nRT/V)',
        description: "Décrit le comportement des gaz hypothétiques sous différentes conditions de pression, volume et température.",
        inputs: [
            { id: 'n', label: 'Quantité (mol)', val: '' },
            { id: 't', label: 'Température (K)', val: '' },
            { id: 'v', label: 'Volume (m³)', val: '' },
            { id: 'r', label: 'Constante R', val: '8.314' }
        ],
        calc: (vals: any) => (vals.n * vals.r * vals.t) / vals.v,
        unit: 'Pascals (Pa)'
    },
    {
        id: 'bernoulli',
        name: 'Bernoulli (P + ½ρv² + ρgh)',
        description: "Principe de conservation de l'énergie pour les fluides. Explique pourquoi la pression diminue quand la vitesse augmente (ex: portance des avions).",
        inputs: [
            { id: 'p', label: 'Pression (Pa)', val: '' },
            { id: 'rho', label: 'Densité (kg/m³)', val: '' },
            { id: 'v', label: 'Vitesse (m/s)', val: '' },
            { id: 'g', label: 'Gravité (m/s²)', val: '9.81' },
            { id: 'h', label: 'Hauteur (m)', val: '' }
        ],
        calc: (vals: any) => vals.p + 0.5 * vals.rho * Math.pow(vals.v, 2) + vals.rho * vals.g * vals.h,
        unit: 'Constante (Pa)'
    },
    {
        id: 'gravity',
        name: 'Poids (P = m.g)',
        description: "La force exercée par la gravité sur un objet (différent de la masse).",
        inputs: [
            { id: 'm', label: 'Masse (kg)', val: '' },
            { id: 'g', label: 'Gravité (m/s²)', val: '9.81' }
        ],
        calc: (vals: any) => vals.m * vals.g,
        unit: 'Newtons (N)'
    },
    {
        id: 'freq',
        name: 'Fréquence (f = 1/T)',
        description: "Le nombre de répétitions d'un phénomène périodique par seconde.",
        inputs: [
            { id: 't', label: 'Période (s)', val: '' }
        ],
        calc: (vals: any) => 1 / vals.t,
        unit: 'Hertz (Hz)'
    }
];

const GRAPH_COLORS = ['#06b6d4', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#f97316'];

const ScientificCalculator: React.FC = () => {
    const [mode, setMode] = useState<Mode>('calc');
    const [calcSubMode, setCalcSubMode] = useState<CalcSubMode>('std');
    const [chemSubMode, setChemSubMode] = useState<ChemSubMode>('table');

    // --- CALCULATOR STATE ---
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [isRad, setIsRad] = useState(true);

    // --- PROBABILITY STATE ---
    const [probN, setProbN] = useState('');
    const [probR, setProbR] = useState('');
    const [probRes, setProbRes] = useState<string>('');

    // --- COMPLEX STATE ---
    const [z1, setZ1] = useState({ r: '', i: '' });
    const [z2, setZ2] = useState({ r: '', i: '' });
    const [complexResult, setComplexResult] = useState('');

    // --- EQUATION STATE ---
    const [eqParams, setEqParams] = useState({ a: '', b: '', c: '' });
    const [eqResult, setEqResult] = useState<string[]>([]);

    // --- CHEMISTRY STATE ---
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [molarFormula, setMolarFormula] = useState('');
    const [molarResult, setMolarResult] = useState<{ mass: number, details: string[] } | null>(null);

    // --- GRAPH STATE ---
    const [functions, setFunctions] = useState([{ id: 1, expression: 'x^2', color: '#06b6d4' }]);
    const [dataPoints, setDataPoints] = useState<{ x: number, y: number }[]>([]);
    const [pointInput, setPointInput] = useState({ x: '', y: '' });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState(40);

    // --- PHYSICS STATE ---
    const [selectedFormula, setSelectedFormula] = useState(PHYSICS_FORMULAS[0].id);
    const [formulaInputs, setFormulaInputs] = useState<Record<string, string>>({});

    // --- UNITS STATE ---
    const [unitCategory, setUnitCategory] = useState('length');
    const [unitFrom, setUnitFrom] = useState('m');
    const [unitTo, setUnitTo] = useState('km');
    const [unitValue, setUnitValue] = useState(1);

    // --- CALCULATOR LOGIC ---
    const handleCalcPress = (val: string) => {
        if (val === 'AC') {
            setExpression('');
            setResult('');
        } else if (val === 'DEL') {
            setExpression(prev => prev.slice(0, -1));
        } else if (val === 'Ans') {
            setExpression(prev => prev + result);
        } else if (val === '=') {
            try {
                let evalString = expression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/π/g, 'Math.PI')
                    .replace(/e/g, 'Math.E')
                    .replace(/\^/g, '**')
                    .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/ln\(/g, 'Math.log(');

                if (!isRad) {
                    evalString = evalString
                        .replace(/sin\(/g, 'Math.sin((Math.PI/180)*')
                        .replace(/cos\(/g, 'Math.cos((Math.PI/180)*')
                        .replace(/tan\(/g, 'Math.tan((Math.PI/180)*');
                } else {
                    evalString = evalString
                        .replace(/sin\(/g, 'Math.sin(')
                        .replace(/cos\(/g, 'Math.cos(')
                        .replace(/tan\(/g, 'Math.tan(');
                }

                // eslint-disable-next-line no-new-func
                const res = new Function('return ' + evalString)();

                let resFormatted = Number(res).toLocaleString('fr-FR', { maximumFractionDigits: 8 });
                if (Number(res) > 1e9 || Number(res) < 1e-9) {
                    resFormatted = Number(res).toExponential(4);
                }

                setResult(String(res));
                setHistory(prev => [`${expression} = ${resFormatted}`, ...prev.slice(0, 9)]);
            } catch (e) {
                setResult('Erreur');
            }
        } else {
            setExpression(prev => prev + val);
        }
    };

    // --- PROBABILITY LOGIC ---
    const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
    const permutation = (n: number, r: number) => factorial(n) / factorial(n - r);
    const combination = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));

    const handleProbaCalc = (type: 'n!' | 'nPr' | 'nCr') => {
        const n = parseInt(probN);
        const r = parseInt(probR);
        if (isNaN(n)) return;

        if (type === 'n!') {
            setProbRes(`${n}! = ${factorial(n)}`);
        } else if (!isNaN(r)) {
            if (type === 'nPr') setProbRes(`P(${n},${r}) = ${permutation(n, r)}`);
            if (type === 'nCr') setProbRes(`C(${n},${r}) = ${combination(n, r)}`);
        }
    };

    // --- COMPLEX LOGIC ---
    const handleComplexCalc = (op: 'add' | 'sub' | 'mul' | 'div' | 'polar') => {
        const c1 = new Complex(parseFloat(z1.r) || 0, parseFloat(z1.i) || 0);
        const c2 = new Complex(parseFloat(z2.r) || 0, parseFloat(z2.i) || 0);
        let res;

        if (op === 'add') res = c1.add(c2).toString();
        else if (op === 'sub') res = c1.sub(c2).toString();
        else if (op === 'mul') res = c1.mul(c2).toString();
        else if (op === 'div') res = c1.div(c2).toString();
        else if (op === 'polar') res = `Z1: ${c1.toPolar()} | Z2: ${c2.toPolar()}`;

        setComplexResult(res || 'Erreur');
    };

    // --- EQUATION LOGIC ---
    const solveQuadratic = () => {
        const a = parseFloat(eqParams.a);
        const b = parseFloat(eqParams.b);
        const c = parseFloat(eqParams.c);
        if (isNaN(a) || isNaN(b) || isNaN(c)) return;

        const delta = b * b - 4 * a * c;
        if (delta > 0) {
            const x1 = (-b - Math.sqrt(delta)) / (2 * a);
            const x2 = (-b + Math.sqrt(delta)) / (2 * a);
            setEqResult([`Δ = ${delta}`, `x1 = ${x1.toFixed(4)}`, `x2 = ${x2.toFixed(4)}`]);
        } else if (delta === 0) {
            const x = -b / (2 * a);
            setEqResult([`Δ = 0`, `x0 = ${x.toFixed(4)}`]);
        } else {
            setEqResult([`Δ = ${delta}`, `Pas de solution réelle`]);
        }
    };

    // --- MOLAR MASS LOGIC ---
    const calculateMolarMass = () => {
        const formula = molarFormula.trim();
        if (!formula) return;

        const regex = /([A-Z][a-z]*)(\d*)/g;
        let match;
        let totalMass = 0;
        let details: string[] = [];
        let isValid = true;

        while ((match = regex.exec(formula)) !== null) {
            const symbol = match[1];
            const count = match[2] ? parseInt(match[2]) : 1;
            const element = ELEMENTS.find(e => e.s === symbol);

            if (element) {
                const mass = element.mass * count;
                totalMass += mass;
                details.push(`${count} x ${element.name} (${element.mass}) = ${mass.toFixed(3)}`);
            } else {
                isValid = false;
                break;
            }
        }

        if (isValid && totalMass > 0) {
            setMolarResult({ mass: totalMass, details });
        } else {
            setMolarResult(null);
            alert("Formule invalide ou élément inconnu");
        }
    };

    // --- GRAPH LOGIC ---
    const drawGraph = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const width = canvas.width = canvas.clientWidth;
        const height = canvas.height = canvas.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = centerX % scale; x < width; x += scale) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        for (let y = centerY % scale; y < height; y += scale) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();

        // Axes
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
        ctx.stroke();

        // Functions
        functions.forEach(funcObj => {
            if (!funcObj.expression.trim()) return;

            ctx.strokeStyle = funcObj.color;
            ctx.lineWidth = 3;
            ctx.beginPath();

            const funcStr = funcObj.expression
                .replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan').replace(/log/g, 'Math.log').replace(/pi/g, 'Math.PI');

            let mathFunc;
            try {
                // Pre-compile function for performance
                // eslint-disable-next-line no-new-func
                mathFunc = new Function('x', `return ${funcStr}`);
            } catch (e) {
                return;
            }

            let hasStarted = false;
            for (let pixelX = 0; pixelX < width; pixelX += 2) {
                const x = (pixelX - centerX) / scale;
                try {
                    const y = mathFunc(x);
                    const pixelY = centerY - (y * scale);
                    if (!isNaN(pixelY) && isFinite(pixelY) && pixelY >= -height && pixelY <= height * 2) {
                        if (!hasStarted) { ctx.moveTo(pixelX, pixelY); hasStarted = true; }
                        else { ctx.lineTo(pixelX, pixelY); }
                    } else {
                        hasStarted = false;
                    }
                } catch (e) { }
            }
            ctx.stroke();
        });

        // Data Points
        dataPoints.forEach(point => {
            const px = centerX + (point.x * scale);
            const py = centerY - (point.y * scale);

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    };

    useEffect(() => {
        if (mode === 'graph') drawGraph();
    }, [mode, functions, dataPoints, scale]);

    const addFunction = () => {
        if (functions.length >= 5) return;
        setFunctions([...functions, {
            id: Date.now(),
            expression: '',
            color: GRAPH_COLORS[functions.length % GRAPH_COLORS.length]
        }]);
    };

    const removeFunction = (id: number) => {
        setFunctions(functions.filter(f => f.id !== id));
    };

    const updateFunction = (id: number, val: string) => {
        setFunctions(functions.map(f => f.id === id ? { ...f, expression: val } : f));
    };

    const addPoint = () => {
        const x = parseFloat(pointInput.x);
        const y = parseFloat(pointInput.y);
        if (!isNaN(x) && !isNaN(y)) {
            setDataPoints([...dataPoints, { x, y }]);
            setPointInput({ x: '', y: '' });
        }
    };

    const handleExportGraph = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'graphique-edulab.png';
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 200));
    const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 5));
    const handleResetZoom = () => setScale(40);

    const handleTabClick = (tabId: string) => {
        if (mode === 'chemistry' && tabId === 'chemistry') {
            setSelectedElement(null);
        }
        setMode(tabId as Mode);
    };

    // --- UNITS LOGIC ---
    const handleUnitCategoryChange = (cat: string) => {
        setUnitCategory(cat);
        const firstUnit = Object.keys(UNIT_CATEGORIES[cat].units)[0];
        const secondUnit = Object.keys(UNIT_CATEGORIES[cat].units)[1] || firstUnit;
        setUnitFrom(firstUnit);
        setUnitTo(secondUnit);
    };

    const getConvertedValue = () => {
        const cat = UNIT_CATEGORIES[unitCategory];
        if (!cat) return 0;
        const fromFactor = cat.units[unitFrom] || 1;
        const toFactor = cat.units[unitTo] || 1;
        return (unitValue * fromFactor) / toFactor;
    };

    const closeElementModal = () => {
        setSelectedElement(null);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeElementModal();
        }
    };

    // Initialize defaults for Physics formulas
    useEffect(() => {
        if (mode === 'physics') {
            const formula = PHYSICS_FORMULAS.find(f => f.id === selectedFormula);
            if (formula) {
                setFormulaInputs(prev => {
                    const next = { ...prev };
                    formula.inputs.forEach(inp => {
                        if (inp.val && next[inp.id] === undefined) {
                            next[inp.id] = inp.val;
                        }
                    });
                    return next;
                });
            }
        }
    }, [mode, selectedFormula]);

    return (
        <div className="min-h-[calc(100vh-140px)] bg-gray-100 dark:bg-gray-900 p-2 md:p-4 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-160px)]">

                {/* Top Bar */}
                <div className="bg-gray-900 text-white p-3 md:p-4 flex flex-col xl:flex-row justify-between items-center gap-3 shrink-0 z-20">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link to="/tools" className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                            <ChevronLeft size={20} />
                        </Link>
                        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                            <Atom className="text-cyan-400" />
                            <span className="hidden sm:inline">Labo Scientifique</span>
                        </h1>
                    </div>

                    <div className="flex bg-gray-800 p-1 rounded-xl overflow-x-auto max-w-full scrollbar-hide">
                        {[
                            { id: 'calc', icon: <Calculator size={16} />, label: 'Calculatrice' },
                            { id: 'chemistry', icon: <FlaskConical size={16} />, label: 'Chimie' },
                            { id: 'graph', icon: <TrendingUp size={16} />, label: 'Graphique' },
                            { id: 'physics', icon: <Zap size={16} />, label: 'Physique' },
                            { id: 'units', icon: <Scale size={16} />, label: 'Unités' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${mode === tab.id
                                        ? 'bg-cyan-500 text-black shadow-lg'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow overflow-hidden relative flex flex-col">

                    {/* --- MODE: CALCULATOR --- */}
                    {mode === 'calc' && (
                        <div className="h-full flex flex-col">
                            {/* Sub-mode switcher */}
                            <div className="p-2 flex gap-2 justify-center bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <button onClick={() => setCalcSubMode('std')} className={`px-3 py-1 rounded-lg text-xs font-bold ${calcSubMode === 'std' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'text-gray-500'}`}>Standard</button>
                                <button onClick={() => setCalcSubMode('proba')} className={`px-3 py-1 rounded-lg text-xs font-bold ${calcSubMode === 'proba' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'text-gray-500'}`}>Probabilité</button>
                                <button onClick={() => setCalcSubMode('complex')} className={`px-3 py-1 rounded-lg text-xs font-bold ${calcSubMode === 'complex' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'text-gray-500'}`}>Complexes</button>
                                <button onClick={() => setCalcSubMode('equation')} className={`px-3 py-1 rounded-lg text-xs font-bold ${calcSubMode === 'equation' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'text-gray-500'}`}>Équations</button>
                            </div>

                            {/* Content Area */}
                            {calcSubMode === 'std' ? (
                                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                                    <div className="flex-grow flex flex-col p-2 md:p-4 h-full overflow-hidden">
                                        {/* Display */}
                                        <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-4 mb-2 text-right font-mono shadow-inner border-2 border-gray-200 dark:border-gray-700 h-24 md:h-32 flex flex-col justify-between shrink-0 relative">
                                            <div className="absolute top-2 left-3 text-[10px] font-bold text-gray-400 dark:text-gray-600">
                                                {isRad ? 'RAD' : 'DEG'}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1 h-6 overflow-hidden mt-4">{expression || ''}</div>
                                            <div className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-cyan-400 overflow-x-auto scrollbar-hide whitespace-nowrap">
                                                {result ? parseFloat(result).toLocaleString('fr-FR', { maximumFractionDigits: 10 }) : '0'}
                                            </div>
                                        </div>

                                        {/* Keypad Controls */}
                                        <div className="flex justify-between items-center mb-2 shrink-0">
                                            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
                                                <button
                                                    onClick={() => setIsRad(true)}
                                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${isRad ? 'bg-white dark:bg-gray-600 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                                >
                                                    RAD
                                                </button>
                                                <button
                                                    onClick={() => setIsRad(false)}
                                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!isRad ? 'bg-white dark:bg-gray-600 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                                >
                                                    DEG
                                                </button>
                                            </div>
                                        </div>

                                        {/* Grid Layout */}
                                        <div className="grid grid-cols-5 gap-1.5 md:gap-2 flex-grow overflow-y-auto min-h-0 auto-rows-[minmax(3.5rem,1fr)] pb-2 pr-1 custom-scrollbar">
                                            {/* Rows ... (Same as before) */}
                                            <button onClick={() => handleCalcPress('sin(')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">sin</button>
                                            <button onClick={() => handleCalcPress('cos(')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">cos</button>
                                            <button onClick={() => handleCalcPress('tan(')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">tan</button>
                                            <button onClick={() => handleCalcPress('AC')} className="col-span-1 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold">AC</button>
                                            <button onClick={() => handleCalcPress('DEL')} className="col-span-1 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold">DEL</button>

                                            <button onClick={() => handleCalcPress('log(')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">log</button>
                                            <button onClick={() => handleCalcPress('ln(')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">ln</button>
                                            <button onClick={() => handleCalcPress('(')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">(</button>
                                            <button onClick={() => handleCalcPress(')')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">)</button>
                                            <button onClick={() => handleCalcPress('÷')} className="col-span-1 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xl font-bold">÷</button>

                                            <button onClick={() => handleCalcPress('π')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">π</button>
                                            <button onClick={() => handleCalcPress('e')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">e</button>
                                            <button onClick={() => handleCalcPress('^')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">^</button>
                                            <button onClick={() => handleCalcPress('√(')} className="col-span-1 rounded-xl bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-medium text-sm">√</button>
                                            <button onClick={() => handleCalcPress('×')} className="col-span-1 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xl font-bold">×</button>

                                            <button onClick={() => handleCalcPress('7')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">7</button>
                                            <button onClick={() => handleCalcPress('8')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">8</button>
                                            <button onClick={() => handleCalcPress('9')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">9</button>
                                            <button onClick={() => handleCalcPress('Ans')} className="col-span-1 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold text-xs uppercase">Ans</button>
                                            <button onClick={() => handleCalcPress('-')} className="col-span-1 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xl font-bold">-</button>

                                            <button onClick={() => handleCalcPress('4')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">4</button>
                                            <button onClick={() => handleCalcPress('5')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">5</button>
                                            <button onClick={() => handleCalcPress('6')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">6</button>
                                            <button onClick={() => handleCalcPress('%')} className="col-span-1 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold">%</button>
                                            <button onClick={() => handleCalcPress('+')} className="col-span-1 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xl font-bold">+</button>

                                            <button onClick={() => handleCalcPress('1')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">1</button>
                                            <button onClick={() => handleCalcPress('2')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">2</button>
                                            <button onClick={() => handleCalcPress('3')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">3</button>
                                            <button onClick={() => handleCalcPress('^2')} className="col-span-1 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold">x²</button>
                                            <button onClick={() => handleCalcPress('=')} className="col-span-1 row-span-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-2xl font-bold shadow-lg shadow-cyan-500/30">=</button>

                                            <button onClick={() => handleCalcPress('0')} className="col-span-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">0</button>
                                            <button onClick={() => handleCalcPress('.')} className="col-span-1 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-600">.</button>
                                            <button onClick={() => handleCalcPress(',')} className="col-span-1 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold">,</button>
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex w-72 bg-gray-50 dark:bg-gray-900/50 border-l border-gray-200 dark:border-gray-700 flex-col p-4">
                                        <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                                            <RotateCcw size={16} /> Historique
                                        </h3>
                                        <div className="space-y-3 overflow-y-auto flex-grow pr-2">
                                            {history.map((item, i) => (
                                                <div key={i} className="text-sm text-right border-b border-gray-200 dark:border-gray-800 pb-2">
                                                    <div className="text-gray-500 mb-1">{item.split('=')[0]}</div>
                                                    <div className="font-bold text-cyan-600 dark:text-cyan-400 text-lg">{item.split('=')[1]}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : calcSubMode === 'proba' ? (
                                <div className="flex-grow p-6 flex flex-col items-center max-w-lg mx-auto w-full">
                                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
                                        <Binary className="text-purple-500" /> Probabilités & Combinatoire
                                    </h2>

                                    <div className="w-full space-y-4 mb-6">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">n (Total)</label>
                                                <input type="number" value={probN} onChange={e => setProbN(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-lg font-bold text-center" placeholder="Ex: 10" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">r (Choix)</label>
                                                <input type="number" value={probR} onChange={e => setProbR(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-lg font-bold text-center" placeholder="Ex: 2" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 w-full mb-8">
                                        <button onClick={() => handleProbaCalc('n!')} className="p-4 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl font-bold hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors">
                                            n! <span className="block text-[10px] font-normal mt-1">Factorielle</span>
                                        </button>
                                        <button onClick={() => handleProbaCalc('nPr')} className="p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl font-bold hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors">
                                            nPr <span className="block text-[10px] font-normal mt-1">Arrangement</span>
                                        </button>
                                        <button onClick={() => handleProbaCalc('nCr')} className="p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors">
                                            nCr <span className="block text-[10px] font-normal mt-1">Combinaison</span>
                                        </button>
                                    </div>

                                    {probRes && (
                                        <div className="w-full p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center border-2 border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 uppercase mb-1">Résultat</div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{probRes}</div>
                                        </div>
                                    )}
                                </div>
                            ) : calcSubMode === 'complex' ? (
                                <div className="flex-grow p-6 flex flex-col items-center max-w-2xl mx-auto w-full overflow-y-auto">
                                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
                                        <RotateCcw className="text-orange-500" /> Nombres Complexes
                                    </h2>

                                    <div className="flex flex-col md:flex-row gap-6 w-full mb-6">
                                        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-3">Z1 = a + bi</h3>
                                            <div className="flex gap-2">
                                                <input type="number" value={z1.r} onChange={e => setZ1({ ...z1, r: e.target.value })} placeholder="Réel (a)" className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm" />
                                                <span className="flex items-center text-gray-400">+</span>
                                                <input type="number" value={z1.i} onChange={e => setZ1({ ...z1, i: e.target.value })} placeholder="Imag (b)" className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm" />
                                                <span className="flex items-center text-gray-400">i</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-3">Z2 = c + di</h3>
                                            <div className="flex gap-2">
                                                <input type="number" value={z2.r} onChange={e => setZ2({ ...z2, r: e.target.value })} placeholder="Réel (c)" className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm" />
                                                <span className="flex items-center text-gray-400">+</span>
                                                <input type="number" value={z2.i} onChange={e => setZ2({ ...z2, i: e.target.value })} placeholder="Imag (d)" className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm" />
                                                <span className="flex items-center text-gray-400">i</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2 w-full mb-8">
                                        <button onClick={() => handleComplexCalc('add')} className="py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">+</button>
                                        <button onClick={() => handleComplexCalc('sub')} className="py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">-</button>
                                        <button onClick={() => handleComplexCalc('mul')} className="py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">×</button>
                                        <button onClick={() => handleComplexCalc('div')} className="py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">÷</button>
                                        <button onClick={() => handleComplexCalc('polar')} className="py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg font-bold hover:bg-orange-200 dark:hover:bg-orange-800 text-xs">Polar</button>
                                    </div>

                                    {complexResult && (
                                        <div className="w-full p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center border-2 border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 uppercase mb-1">Résultat</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{complexResult}</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-grow p-6 flex flex-col items-center max-w-lg mx-auto w-full">
                                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
                                        <Sigma className="text-red-500" /> Équation Second Degré
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-6">Format : ax² + bx + c = 0</p>

                                    <div className="flex gap-4 items-center mb-8 w-full">
                                        <input type="number" value={eqParams.a} onChange={e => setEqParams({ ...eqParams, a: e.target.value })} placeholder="a" className="w-1/3 p-3 text-center font-bold text-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
                                        <span className="font-serif italic">x² +</span>
                                        <input type="number" value={eqParams.b} onChange={e => setEqParams({ ...eqParams, b: e.target.value })} placeholder="b" className="w-1/3 p-3 text-center font-bold text-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
                                        <span className="font-serif italic">x +</span>
                                        <input type="number" value={eqParams.c} onChange={e => setEqParams({ ...eqParams, c: e.target.value })} placeholder="c" className="w-1/3 p-3 text-center font-bold text-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
                                        <span className="font-serif italic">= 0</span>
                                    </div>

                                    <button onClick={solveQuadratic} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all mb-8">
                                        Résoudre
                                    </button>

                                    {eqResult.length > 0 && (
                                        <div className="w-full p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 space-y-2">
                                            {eqResult.map((res, i) => (
                                                <div key={i} className="font-mono text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 last:border-0 pb-1 last:pb-0">
                                                    {res}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- MODE: CHEMISTRY --- */}
                    {mode === 'chemistry' && (
                        <div className="h-full flex flex-col relative bg-[#1e1e1e]">
                            {/* Chemistry Toolbar */}
                            <div className="p-2 flex gap-2 justify-center bg-[#252526] border-b border-gray-700">
                                <button onClick={() => setChemSubMode('table')} className={`px-3 py-1 rounded-lg text-xs font-bold ${chemSubMode === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Tableau Périodique</button>
                                <button onClick={() => setChemSubMode('molar')} className={`px-3 py-1 rounded-lg text-xs font-bold ${chemSubMode === 'molar' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Masse Molaire</button>
                            </div>

                            {chemSubMode === 'table' ? (
                                <div className="flex-grow overflow-auto p-2 md:p-4 relative">
                                    <div className="grid grid-cols-[repeat(18,minmax(36px,1fr))] gap-1 auto-rows-[minmax(36px,1fr)] overflow-x-auto min-w-[800px] pb-12">
                                        {ELEMENTS.map(el => (
                                            <div
                                                key={el.s}
                                                onClick={() => setSelectedElement(el)}
                                                className={`relative p-1 rounded border hover:scale-125 hover:z-10 transition-transform cursor-pointer flex flex-col items-center justify-center ${CATEGORY_COLORS[el.cat] || 'bg-gray-200'}`}
                                                style={{ gridColumn: el.col, gridRow: el.row }}
                                                title={el.name}
                                            >
                                                <span className="text-[9px] absolute top-0.5 left-1 opacity-70">{el.n}</span>
                                                <span className="font-bold text-sm md:text-base">{el.s}</span>
                                                <span className="text-[8px] hidden md:block">{el.mass.toFixed(1)}</span>
                                            </div>
                                        ))}

                                        <div className="relative p-1 rounded border flex flex-col items-center justify-center bg-indigo-100 text-indigo-900 opacity-50 text-[10px]" style={{ gridColumn: 3, gridRow: 6 }}>
                                            57-71
                                        </div>
                                        <div className="relative p-1 rounded border flex flex-col items-center justify-center bg-gray-200 text-gray-900 opacity-50 text-[10px]" style={{ gridColumn: 3, gridRow: 7 }}>
                                            89-103
                                        </div>
                                    </div>

                                    {/* Detail Modal */}
                                    {selectedElement && (
                                        <div
                                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in"
                                            onClick={handleBackdropClick}
                                        >
                                            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden animate-in zoom-in-95 duration-200">
                                                <div className={`absolute top-0 left-0 w-full h-24 ${CATEGORY_COLORS[selectedElement.cat].split(' ')[0]} opacity-30`}></div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        closeElementModal();
                                                    }}
                                                    className="absolute top-4 right-4 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 z-20 p-2 rounded-full transition-colors cursor-pointer"
                                                    title="Fermer"
                                                    type="button"
                                                >
                                                    <X size={24} />
                                                </button>

                                                <div className="relative z-10 flex flex-col items-center -mt-2">
                                                    <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center mb-4 shadow-xl border-4 border-white dark:border-gray-800 ${CATEGORY_COLORS[selectedElement.cat] || 'bg-gray-200 text-black'}`}>
                                                        <span className="text-xs opacity-70 font-semibold">{selectedElement.n}</span>
                                                        <span className="text-4xl font-bold">{selectedElement.s}</span>
                                                    </div>

                                                    <h2 className="text-3xl font-bold mb-1">{selectedElement.name}</h2>
                                                    <div className="px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                                                        {selectedElement.cat}
                                                    </div>
                                                </div>

                                                <div className="mt-6 space-y-3 relative z-10">
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                                        {getElementDescription(selectedElement)}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                            <div className="text-xs text-gray-500 uppercase font-bold">Masse</div>
                                                            <div className="font-mono font-bold">{selectedElement.mass} u</div>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                            <div className="text-xs text-gray-500 uppercase font-bold">Position</div>
                                                            <div className="font-mono font-bold">L{selectedElement.row}, C{selectedElement.col}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-grow p-8 flex flex-col items-center max-w-xl mx-auto w-full overflow-y-auto">
                                    <h2 className="text-2xl font-bold text-white mb-2">Calculateur de Masse Molaire</h2>
                                    <p className="text-gray-400 text-sm mb-8 text-center">Entrez une formule chimique (ex: H2SO4, C6H12O6) pour obtenir sa masse exacte.</p>

                                    <div className="w-full relative mb-6">
                                        <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            value={molarFormula}
                                            onChange={e => setMolarFormula(e.target.value)}
                                            placeholder="Ex: NaCl"
                                            className="w-full p-4 pl-12 bg-[#252526] border border-gray-600 rounded-xl text-white font-mono text-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>

                                    <button onClick={calculateMolarMass} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-colors mb-8">
                                        Calculer
                                    </button>

                                    {molarResult && (
                                        <div className="w-full bg-[#252526] rounded-2xl p-6 border border-gray-700 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="flex justify-between items-end mb-4 pb-4 border-b border-gray-700">
                                                <span className="text-gray-400 text-sm uppercase font-bold">Masse Totale</span>
                                                <span className="text-3xl font-bold text-green-400">{molarResult.mass.toFixed(3)} <span className="text-sm text-gray-500">g/mol</span></span>
                                            </div>
                                            <div className="space-y-2">
                                                {molarResult.details.map((detail, i) => (
                                                    <div key={i} className="text-gray-300 font-mono text-sm flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                                        {detail}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- MODE: GRAPH --- */}
                    {mode === 'graph' && (
                        <div className="h-full flex flex-col relative">
                            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-900/90 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm w-80 max-h-[calc(100%-2rem)] overflow-y-auto">

                                <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">Fonctions</h3>
                                        <button onClick={addFunction} className="text-xs bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-600 transition-colors flex items-center gap-1">
                                            <Plus size={12} /> Ajouter
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {functions.map((func, idx) => (
                                            <div key={func.id} className="flex gap-2 items-center">
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: func.color }}></div>
                                                <span className="text-gray-400 font-serif italic text-sm">f{idx + 1}=</span>
                                                <input
                                                    type="text"
                                                    value={func.expression}
                                                    onChange={(e) => updateFunction(func.id, e.target.value)}
                                                    className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-cyan-500 outline-none text-sm font-mono rounded px-2 py-1 text-gray-900 dark:text-white"
                                                    placeholder="ex: x^2"
                                                />
                                                <button onClick={() => removeFunction(func.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Points</h3>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="number"
                                            placeholder="X"
                                            value={pointInput.x}
                                            onChange={(e) => setPointInput({ ...pointInput, x: e.target.value })}
                                            className="w-1/3 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-cyan-500 outline-none text-sm rounded px-2 py-1 text-gray-900 dark:text-white"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Y"
                                            value={pointInput.y}
                                            onChange={(e) => setPointInput({ ...pointInput, y: e.target.value })}
                                            className="w-1/3 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-cyan-500 outline-none text-sm rounded px-2 py-1 text-gray-900 dark:text-white"
                                        />
                                        <button onClick={addPoint} className="flex-grow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
                                            Ajouter
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {dataPoints.map((p, i) => (
                                            <div key={i} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                                                <Circle size={6} className="fill-white" />
                                                ({p.x}, {p.y})
                                                <button onClick={() => setDataPoints(dataPoints.filter((_, idx) => idx !== i))} className="hover:text-red-500 ml-1"><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleExportGraph} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                    <Camera size={16} /> Exporter Graphique
                                </button>
                            </div>

                            {/* Zoom Controls */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                <button onClick={handleZoomIn} className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                                    <ZoomIn size={20} />
                                </button>
                                <button onClick={handleZoomOut} className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                                    <ZoomOut size={20} />
                                </button>
                                <button onClick={handleResetZoom} className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors backdrop-blur-sm border border-gray-200 dark:border-gray-700" title="Réinitialiser">
                                    <RefreshCcw size={20} />
                                </button>
                            </div>

                            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
                        </div>
                    )}

                    {/* --- MODE: PHYSICS FORMULAS --- */}
                    {mode === 'physics' && (
                        <div className="h-full overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
                            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                                {/* Sidebar List */}
                                <div className="md:col-span-1 space-y-2">
                                    <h3 className="font-bold text-gray-500 uppercase text-xs mb-4">Lois Fondamentales</h3>
                                    {PHYSICS_FORMULAS.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setSelectedFormula(f.id)}
                                            className={`w-full text-left p-4 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${selectedFormula === f.id
                                                    ? 'bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 shadow-md border-l-4 border-cyan-500'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {f.name}
                                            <ChevronLeft size={16} className={`rotate-180 transition-transform ${selectedFormula === f.id ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    ))}
                                </div>

                                {/* Calculator Area */}
                                <div className="md:col-span-2">
                                    {(() => {
                                        const formula = PHYSICS_FORMULAS.find(f => f.id === selectedFormula);
                                        if (!formula) return null;

                                        const numInputs: Record<string, number> = {};
                                        Object.keys(formulaInputs).forEach(k => {
                                            numInputs[k] = parseFloat(formulaInputs[k].replace(',', '.'));
                                        });

                                        const result = formula.calc(numInputs);

                                        const hasAllInputs = formula.inputs.every(inp => {
                                            const val = formulaInputs[inp.id];
                                            return val !== undefined && val !== '' && !isNaN(parseFloat(val.replace(',', '.')));
                                        });

                                        return (
                                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formula.name}</h2>

                                                {formula.description && (
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 italic">
                                                        {formula.description}
                                                    </p>
                                                )}

                                                <div className="grid gap-6 mb-8">
                                                    {formula.inputs.map(inp => (
                                                        <div key={inp.id}>
                                                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{inp.label}</label>
                                                            <input
                                                                type="number"
                                                                value={formulaInputs[inp.id] || ''}
                                                                onChange={(e) => setFormulaInputs({ ...formulaInputs, [inp.id]: e.target.value })}
                                                                className="w-full p-4 bg-gray-100 dark:bg-gray-900 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                                                placeholder={inp.val || "0"}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${hasAllInputs ? 'bg-cyan-500 text-white shadow-lg scale-100' : 'bg-gray-100 dark:bg-gray-900 text-gray-400 scale-95 opacity-50'}`}>
                                                    <div className="text-sm font-bold uppercase opacity-80 mb-1">Résultat</div>
                                                    <div className="text-4xl font-bold">
                                                        {hasAllInputs ? result.toLocaleString('fr-FR', { maximumFractionDigits: 4 }) : '---'}
                                                    </div>
                                                    <div className="text-sm font-medium opacity-80 mt-1">{formula.unit}</div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MODE: UNITS --- */}
                    {mode === 'units' && (
                        <div className="h-full overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
                            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Scale className="text-cyan-500" />
                                    Convertisseur d'Unités
                                </h2>

                                <div className="space-y-6">

                                    {/* Category Selector */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Catégorie</label>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {Object.keys(UNIT_CATEGORIES).map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleUnitCategoryChange(cat)}
                                                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${unitCategory === cat
                                                            ? 'bg-cyan-500 text-white shadow-md'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {UNIT_CATEGORIES[cat].name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Conversion Inputs */}
                                    <div className="grid md:grid-cols-2 gap-8 items-center">
                                        {/* From */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">De</label>
                                                <select
                                                    value={unitFrom}
                                                    onChange={(e) => setUnitFrom(e.target.value)}
                                                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium outline-none focus:border-cyan-500"
                                                >
                                                    {Object.keys(UNIT_CATEGORIES[unitCategory].units).map(u => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <input
                                                type="number"
                                                value={unitValue}
                                                onChange={(e) => setUnitValue(parseFloat(e.target.value))}
                                                className="w-full p-4 bg-gray-100 dark:bg-gray-900 rounded-2xl font-bold text-2xl outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white text-center"
                                            />
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex justify-center">
                                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400">
                                                <ArrowLeftRight size={24} />
                                            </div>
                                        </div>

                                        {/* To */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Vers</label>
                                                <select
                                                    value={unitTo}
                                                    onChange={(e) => setUnitTo(e.target.value)}
                                                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium outline-none focus:border-cyan-500"
                                                >
                                                    {Object.keys(UNIT_CATEGORIES[unitCategory].units).map(u => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-full p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-2xl font-bold text-2xl text-cyan-700 dark:text-cyan-400 text-center flex items-center justify-center min-h-[64px]">
                                                {getConvertedValue().toLocaleString('fr-FR', { maximumFractionDigits: 6 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScientificCalculator;