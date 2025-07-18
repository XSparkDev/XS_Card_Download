import { NextRequest, NextResponse } from 'next/server'
import { detectOS, detectBrowser, detectDeviceType, detectScreenSize } from '@/lib/device-detection'

export async function GET(request: NextRequest) {
  try {
    // Get User-Agent from request headers
    const userAgent = request.headers.get('user-agent') || ''
    
    // Create a mock window object for server-side detection
    const mockWindow = {
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1,
      matchMedia: () => ({ matches: false }),
      navigator: {
        userAgent,
        maxTouchPoints: 0,
        standalone: false,
      },
      ontouchstart: null,
    } as any

    // Temporarily replace global window for detection
    const originalWindow = (global as any).window
    ;(global as any).window = mockWindow

    // Perform detection
    const os = detectOS()
    const browser = detectBrowser()
    const deviceType = detectDeviceType(mockWindow.innerWidth)
    const screenSize = detectScreenSize(mockWindow.innerWidth)

    // Restore original window
    ;(global as any).window = originalWindow

    // Return device information
    return NextResponse.json({
      success: true,
      data: {
        userAgent,
        os: os.os,
        osVersion: os.version,
        browser: browser.browser,
        browserVersion: browser.version,
        deviceType,
        screenSize,
        width: mockWindow.innerWidth,
        height: mockWindow.innerHeight,
        timestamp: new Date().toISOString(),
      },
      message: 'Device information retrieved successfully',
    })
  } catch (error) {
    console.error('Error detecting device:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to detect device information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAgent, width, height } = body

    if (!userAgent) {
      return NextResponse.json(
        {
          success: false,
          error: 'User-Agent is required',
        },
        { status: 400 }
      )
    }

    // Create a mock window object with provided dimensions
    const mockWindow = {
      innerWidth: width || 1024,
      innerHeight: height || 768,
      devicePixelRatio: 1,
      matchMedia: () => ({ matches: false }),
      navigator: {
        userAgent,
        maxTouchPoints: 0,
        standalone: false,
      },
      ontouchstart: null,
    } as any

    // Temporarily replace global window for detection
    const originalWindow = (global as any).window
    ;(global as any).window = mockWindow

    // Perform detection
    const os = detectOS()
    const browser = detectBrowser()
    const deviceType = detectDeviceType(mockWindow.innerWidth)
    const screenSize = detectScreenSize(mockWindow.innerWidth)

    // Restore original window
    ;(global as any).window = originalWindow

    // Return device information
    return NextResponse.json({
      success: true,
      data: {
        userAgent,
        os: os.os,
        osVersion: os.version,
        browser: browser.browser,
        browserVersion: browser.version,
        deviceType,
        screenSize,
        width: mockWindow.innerWidth,
        height: mockWindow.innerHeight,
        timestamp: new Date().toISOString(),
      },
      message: 'Device information processed successfully',
    })
  } catch (error) {
    console.error('Error processing device information:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process device information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 