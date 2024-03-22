export interface PostData {
    title: string;
    contentFile: string;
    summary?: string;
    categories?: string[];
    author?: string;
}

export interface CategoryData {
    name: string;
    children?: CategoryData[];
}

export interface CarouselData {
    title: string;
    description: string;
    image: string;
}

export const categories: CategoryData[] = [
    {
        name: 'category1',
        children: [
            {
                name: 'category1_sub1',
                children: [
                    { name: 'category1_sub1_sub1' },
                    { name: 'category1_sub1_sub2' },
                    { name: 'category1_sub1_sub3' },
                ],
            },
            {
                name: 'category1_sub2',
                children: [{ name: 'category1_sub2_sub1' }, { name: 'category1_sub2_sub2' }],
            },
            {
                name: 'category1_sub3',
                children: [{ name: 'category1_sub3_sub1' }],
            },
            {
                name: 'category1_sub4',
            },
            {
                name: 'category1_sub5',
            },
            {
                name: 'category1_sub6',
            },
        ],
    },
    {
        name: 'category2',
        children: [
            {
                name: 'category2_sub1',
            },
            {
                name: 'category2_sub2',
            },
        ],
    },
];
export const carousels: CarouselData[] = [
    {
        title: 'FIRM NEWS1',
        description: 'Global Pharmaceutical, Medical Device Company Notches Defense Verdict',
        image: '1.jpeg',
    },
    {
        title: 'FIRM NEWS2',
        description: 'Meet Troutman Pepper Plus, Our Client Value Program',
        image: '2.jpeg',
    },
    {
        title: 'FIRM NEWS3',
        description: 'Global Pharmaceutical, Medical Device Company Notches Defense Verdict',
        image: '3.jpeg',
    },
    {
        title: 'FIRM NEWS4',
        description: 'Meet Troutman Pepper Plus, Our Client Value Program',
        image: '2.jpeg',
    },
];
