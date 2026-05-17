'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

interface ProductGridProps {
    products: any[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-wrap justify-center gap-8"
        >
            {products.map((product) => (
                <motion.div
                    key={product.id}
                    variants={item}
                    className="w-full sm:w-[calc(50%-2rem)] lg:w-[calc(25%-2rem)] min-w-[280px] max-w-[340px]"
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ProductGrid;
