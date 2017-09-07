import { Injectable } from '@angular/core';

@Injectable()
export class Barrios {

    public barrios: { [key: string]: any; } = {
        B: ["Banco San Miguel", "Barrio Obrero", "Bañado Cará Cará", "Bella Vista", "Botánico"],
        C: ["Campo Grande", "Cañada del Ybyray", "Ciudad Nueva"],
        D: ["Dr. Francia"],
        E: ["La Encarnación"],
        G: ["General Caballero", "General Díaz"],
        H: ["Herrera", "Barrio Hipódromo"],
        I: ["Itá Enramada", "Itá Pytã Punta"],
        J: ["Jara"],
        L: ["Carlos A. López", "La Catedral", "Las Lomas", "Loma Pytá", "Los Laureles"],
        M: ["Madame Lynch","Manorá","Mariscal Estigarribia","Mariscal López","Mbocayaty","Mburicaó","Mburucuyá","Las Mercedes"],
        N: ["Nazareth"],
        NH: ["Ñu Guazú"],
        P: ["Pettirossi", "Pinozá"],
        R: ["Roberto L. Pettit", "Recoleta", "Republicano", "Ricardo Brugada"],
        S: ["Sajonia", "Salvador del Mundo", "San Antonio", "San Blas", "San Cristóbal", "San Jorge", "San Pablo", "San Rafael", "San Roque", "San Vicente",
            "Santa Ana", "Santa María", "Santa Rosa", "Santo Domingo", "Santísima Trinidad"],
        T: ["Tablada Nueva", "Tacumbú", "Tembetary", "Terminal"],
        V: ["Villa Aurelia", "Villa Morra", "Virgen de Fátima", "Virgen de la Asunción", "Virgen del Huerto", "Vista Alegre"],
        Y: ["Ycuá Satí", "Ytay"]
    };

    constructor() {

    }

    public getBarrios () {
        return this.barrios;
    }
}