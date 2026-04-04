/**
 * Known Hospitals Database
 * Comprehensive list of hospitals by district with addresses and contact information
 */

export interface KnownHospital {
    name: string;
    address: string;
    district: string;
    type: 'District' | 'Medical_College' | 'CHC' | 'PHC' | 'Private';
    contact?: string;
    specialties?: string[];
    maternityBeds?: number;
}

export const KNOWN_HOSPITALS: Record<string, KnownHospital[]> = {
    'Lucknow': [
        {
            name: 'King George\'s Medical University (KGMU)',
            address: 'Shah Mina Road, Chowk, Lucknow - 226003',
            district: 'Lucknow',
            type: 'Medical_College',
            contact: '0522-2257450',
            specialties: ['Maternity', 'Emergency', 'ICU', 'NICU'],
            maternityBeds: 200
        },
        {
            name: 'Queen Mary\'s Hospital',
            address: 'Lalbagh, Lucknow - 226001',
            district: 'Lucknow',
            type: 'District',
            contact: '0522-2620347',
            specialties: ['Maternity', 'Gynecology', 'Pediatrics'],
            maternityBeds: 150
        },
        {
            name: 'Balrampur Hospital',
            address: 'Balrampur, Lucknow - 226001',
            district: 'Lucknow',
            type: 'District',
            contact: '0522-2620078',
            specialties: ['Maternity', 'Emergency', 'General Surgery'],
            maternityBeds: 120
        },
        {
            name: 'Lok Bandhu Rajnarayan Combined Hospital',
            address: 'Sector-5, Vikas Nagar, Lucknow - 226022',
            district: 'Lucknow',
            type: 'District',
            contact: '0522-2335555',
            specialties: ['Maternity', 'Emergency'],
            maternityBeds: 80
        },
        {
            name: 'Civil Hospital Lucknow',
            address: 'Qaiserbagh, Lucknow - 226001',
            district: 'Lucknow',
            type: 'District',
            contact: '0522-2620001',
            specialties: ['Maternity', 'General Medicine'],
            maternityBeds: 60
        },
        {
            name: 'CHC Malihabad',
            address: 'Malihabad, Lucknow - 226102',
            district: 'Lucknow',
            type: 'CHC',
            contact: '0522-2791234',
            specialties: ['Maternity', 'Primary Care'],
            maternityBeds: 30
        },
        {
            name: 'CHC Mohanlalganj',
            address: 'Mohanlalganj, Lucknow - 226301',
            district: 'Lucknow',
            type: 'CHC',
            contact: '0522-2891234',
            specialties: ['Maternity', 'Primary Care'],
            maternityBeds: 25
        },
        {
            name: 'Sahara Hospital',
            address: 'Viraj Khand, Gomti Nagar, Lucknow - 226010',
            district: 'Lucknow',
            type: 'Private',
            contact: '0522-4007777',
            specialties: ['Maternity', 'ICU', 'NICU'],
            maternityBeds: 40
        },
        {
            name: 'Mayo Hospital',
            address: 'Lalbagh, Lucknow - 226001',
            district: 'Lucknow',
            type: 'Private',
            contact: '0522-2620909',
            specialties: ['Maternity', 'Gynecology'],
            maternityBeds: 35
        }
    ],
    'Kanpur': [
        {
            name: 'Ganesh Shankar Vidyarthi Memorial Medical College (GSVM)',
            address: 'Swaroop Nagar, Kanpur - 208002',
            district: 'Kanpur',
            type: 'Medical_College',
            contact: '0512-2556666',
            specialties: ['Maternity', 'Emergency', 'ICU'],
            maternityBeds: 180
        },
        {
            name: 'Lala Lajpat Rai Hospital',
            address: 'Kanpur - 208001',
            district: 'Kanpur',
            type: 'District',
            contact: '0512-2216666',
            specialties: ['Maternity', 'General Medicine'],
            maternityBeds: 100
        },
        {
            name: 'Ursula Horsman Memorial Hospital',
            address: 'Civil Lines, Kanpur - 208001',
            district: 'Kanpur',
            type: 'District',
            contact: '0512-2311234',
            specialties: ['Maternity', 'Pediatrics'],
            maternityBeds: 70
        }
    ],
    'Agra': [
        {
            name: 'SN Medical College',
            address: 'Agra - 282002',
            district: 'Agra',
            type: 'Medical_College',
            contact: '0562-2850001',
            specialties: ['Maternity', 'Emergency', 'ICU'],
            maternityBeds: 150
        },
        {
            name: 'District Women Hospital',
            address: 'MG Road, Agra - 282001',
            district: 'Agra',
            type: 'District',
            contact: '0562-2460123',
            specialties: ['Maternity', 'Gynecology'],
            maternityBeds: 90
        }
    ],
    'Varanasi': [
        {
            name: 'Banaras Hindu University Hospital (BHU)',
            address: 'Lanka, Varanasi - 221005',
            district: 'Varanasi',
            type: 'Medical_College',
            contact: '0542-2369444',
            specialties: ['Maternity', 'Emergency', 'ICU', 'NICU'],
            maternityBeds: 160
        },
        {
            name: 'Pandit Deen Dayal Upadhyay Hospital',
            address: 'Kabir Chaura, Varanasi - 221001',
            district: 'Varanasi',
            type: 'District',
            contact: '0542-2506789',
            specialties: ['Maternity', 'General Medicine'],
            maternityBeds: 80
        }
    ],
    'Prayagraj': [
        {
            name: 'Motilal Nehru Medical College',
            address: 'Lowther Road, Prayagraj - 211001',
            district: 'Prayagraj',
            type: 'Medical_College',
            contact: '0532-2460063',
            specialties: ['Maternity', 'Emergency', 'ICU'],
            maternityBeds: 140
        },
        {
            name: 'Swaroop Rani Nehru Hospital',
            address: 'Colvin Road, Prayagraj - 211001',
            district: 'Prayagraj',
            type: 'District',
            contact: '0532-2460789',
            specialties: ['Maternity', 'Gynecology'],
            maternityBeds: 75
        }
    ],
    'Gorakhpur': [
        {
            name: 'BRD Medical College',
            address: 'Medical College Road, Gorakhpur - 273013',
            district: 'Gorakhpur',
            type: 'Medical_College',
            contact: '0551-2340001',
            specialties: ['Maternity', 'Emergency', 'Pediatrics'],
            maternityBeds: 130
        },
        {
            name: 'District Women Hospital',
            address: 'Civil Lines, Gorakhpur - 273001',
            district: 'Gorakhpur',
            type: 'District',
            contact: '0551-2201234',
            specialties: ['Maternity', 'Gynecology'],
            maternityBeds: 65
        }
    ],
    'Bareilly': [
        {
            name: 'Rohilkhand Medical College',
            address: 'Pilibhit Bypass Road, Bareilly - 243006',
            district: 'Bareilly',
            type: 'Medical_College',
            contact: '0581-2460001',
            specialties: ['Maternity', 'Emergency', 'ICU'],
            maternityBeds: 120
        },
        {
            name: 'District Hospital Bareilly',
            address: 'Civil Lines, Bareilly - 243001',
            district: 'Bareilly',
            type: 'District',
            contact: '0581-2501234',
            specialties: ['Maternity', 'General Medicine'],
            maternityBeds: 70
        }
    ],
    'Meerut': [
        {
            name: 'Lala Lajpat Rai Memorial Medical College',
            address: 'Garh Road, Meerut - 250004',
            district: 'Meerut',
            type: 'Medical_College',
            contact: '0121-2763285',
            specialties: ['Maternity', 'Emergency', 'ICU'],
            maternityBeds: 110
        },
        {
            name: 'District Women Hospital',
            address: 'Meerut Cantt, Meerut - 250001',
            district: 'Meerut',
            type: 'District',
            contact: '0121-2601234',
            specialties: ['Maternity', 'Gynecology'],
            maternityBeds: 60
        }
    ]
};

/**
 * Get all known hospitals for a district
 */
export const getKnownHospitalsByDistrict = (district: string): KnownHospital[] => {
    return KNOWN_HOSPITALS[district] || [];
};

/**
 * Get all districts with known hospitals
 */
export const getAllDistricts = (): string[] => {
    return Object.keys(KNOWN_HOSPITALS).sort();
};

/**
 * Search known hospitals by name or address
 */
export const searchKnownHospitals = (query: string): KnownHospital[] => {
    const lowerQuery = query.toLowerCase();
    const results: KnownHospital[] = [];

    Object.values(KNOWN_HOSPITALS).forEach(hospitals => {
        hospitals.forEach(hospital => {
            if (
                hospital.name.toLowerCase().includes(lowerQuery) ||
                hospital.address.toLowerCase().includes(lowerQuery) ||
                hospital.district.toLowerCase().includes(lowerQuery)
            ) {
                results.push(hospital);
            }
        });
    });

    return results;
};
