// Lift the subject out of a photograph, using the system's own segmentation.
//
// scripts/cutout.py keys on warmth and texture, which works for a person on a
// flat studio backdrop and fails completely on a photograph with a real
// background. Vision's foreground-instance mask is the same model Preview uses
// for "Remove Background", and it is already on the machine.
//
//   swift scripts/subject-cutout.swift <input> <output.png>

import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write("usage: subject-cutout <input> <output.png>\n".data(using: .utf8)!)
    exit(2)
}

let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard let source = CIImage(contentsOf: inputURL) else {
    FileHandle.standardError.write("cannot read \(inputURL.path)\n".data(using: .utf8)!)
    exit(1)
}

let handler = VNImageRequestHandler(ciImage: source, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()

do {
    try handler.perform([request])
    guard let result = request.results?.first else {
        FileHandle.standardError.write("no subject found\n".data(using: .utf8)!)
        exit(1)
    }
    // Every instance at once: the coat, the hands and the shoes are one subject.
    let masked = try result.generateMaskedImage(
        ofInstances: result.allInstances,
        from: handler,
        croppedToInstancesExtent: true
    )
    let ci = CIImage(cvPixelBuffer: masked)
    let context = CIContext()
    guard let data = context.pngRepresentation(
        of: ci,
        format: .RGBA8,
        colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!
    ) else {
        FileHandle.standardError.write("cannot encode png\n".data(using: .utf8)!)
        exit(1)
    }
    try data.write(to: outputURL)
    print("wrote \(outputURL.path) — \(Int(ci.extent.width))x\(Int(ci.extent.height)), \(result.allInstances.count) instance(s)")
} catch {
    FileHandle.standardError.write("vision failed: \(error)\n".data(using: .utf8)!)
    exit(1)
}
