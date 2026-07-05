import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || ''
    const category = req.nextUrl.searchParams.get('category') || ''
    
    const where: any = {}
    if (search) {
      where.name = { contains: search }
    }
    if (category) {
      where.category = category
    }
    
    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const product = await db.product.create({
      data: {
        name: body.name,
        category: body.category || 'General',
        unit: body.unit || 'Pcs',
        price: parseFloat(body.price),
        stock: parseInt(body.stock) || 0,
        image: body.image || null,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const product = await db.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        category: body.category,
        unit: body.unit,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
        image: body.image,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
