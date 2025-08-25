"use client"

import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from './ui/breadcrumb';
import { MobileSidebar } from './sidebar';
import { usePathname } from 'next/navigation';

const BreadcrumbHeader = () => {

    const pathName = usePathname();
    const paths = pathName === '/' ? [""] : pathName.split('/');

    return (
        <div className='flex items-center flex-start'>
            <MobileSidebar />
            <Breadcrumb>
                {paths.map((path, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbItem>
                            <BreadcrumbLink className='capitalize' href={`/${path}`}>
                                {path === '' ? "home" : path}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </Breadcrumb>
        </div>
    )
}

export default BreadcrumbHeader
