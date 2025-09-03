/**
 * exporters.ts
 * ---------------------------------------------------------
 * DOCX export helpers:
 * - generateDocxFromParagraphs: create a .docx from paragraphs and basic style
 * - generateDocxFromTemplate: if template contains {content}, inject text; else fallback
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

/** Preview style subset to drive export layout */
export interface ExportStyle {
  fontFamily?: string
  fontSizePt?: number
  lineHeight?: number
  justify?: boolean
  firstLineIndent?: string // not directly supported by docx lib as CSS, but we can approximate
}

/**
 * Creates a simple .docx with provided paragraphs.
 */
export async function generateDocxFromParagraphs(
  paragraphs: string[],
  style: ExportStyle = {}
): Promise<Blob> {
  const {
    fontFamily = 'Times New Roman',
    fontSizePt = 12,
    justify = true,
  } = style

  const children = paragraphs.map(
    (p) =>
      new Paragraph({
        alignment: justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: p,
            font: fontFamily,
            size: fontSizePt * 2, // docx uses half-points
          }),
        ],
      })
  )

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children.length > 0 ? children : [new Paragraph('')],
      },
    ],
  })

  return await Packer.toBlob(doc)
}

/**
 * Uses docxtemplater with a DOCX template to inject content into {content} placeholder.
 * If the template does not have the placeholder or rendering fails, throws an error.
 */
export async function generateDocxFromTemplate(
  templateArrayBuffer: ArrayBuffer,
  contentText: string
): Promise<Blob> {
  const zip = new PizZip(templateArrayBuffer)
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
  doc.setData({ content: contentText })
  doc.render()
  const out: Blob = doc
    .getZip()
    .generate({
      type: 'blob',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  return out
}
