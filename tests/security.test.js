const assert = require("node:assert")
const fs = require("node:fs")
const vm = require("node:vm")

const code = fs.readFileSync("Code.gs", "utf8")
const index = fs.readFileSync("index.html", "utf8")
const publicScript = fs.readFileSync("scripts/index.js", "utf8")
const api = fs.readFileSync("scripts/api.js", "utf8")
const walkin = fs.readFileSync("scripts/admin-walkin.js", "utf8")

assert.match(
  code,
  /function requireAdmin_\s*\(\s*providedKey\s*\)/
)
assert.match(
  code,
  /getProperty\s*\(\s*"ADMIN_KEY"\s*\)/
)
assert.match(
  code,
  /Utilities\.DigestAlgorithm\.SHA_256/
)
assert.match(
  code,
  /function sameDigest_\s*\(/
)
assert.match(
  code,
  /expectedKey\.length < 32/
)
assert.match(
  code,
  /receivedKey\.length > 128/
)
assert.match(
  code,
  /"UNAUTHORIZED"/
)
assert.match(
  code,
  /"INTERNAL_ERROR"/
)
assert.match(
  publicScript,
  /Array\.isArray\s*\(\s*value\s*\)/
)
assert.match(
  publicScript,
  /sessionStorage\.removeItem\s*\(\s*KODE_STORAGE\s*\)/
)
assert.match(
  api,
  /const ADMIN_ACTIONS = new Set/
)
assert.match(
  api,
  /request\.adminKey = getKey\s*\(\s*\)/
)
assert.match(
  api,
  /body: JSON\.stringify\s*\(\s*request\s*\)/
)
assert.doesNotMatch(
  api,
  /Object\.assign\s*\(\s*\{\}\s*,\s*payload\s*,\s*\{\s*adminKey/
)

assert.match(
  code,
  /requireAdmin_\s*\(\s*e\.adminKey\s*\)/
)
assert.match(
  code,
  /LockService\.getScriptLock\s*\(\s*\)/
)
assert.match(
  code,
  /function isFormula_\s*\(/
)
assert.match(
  code,
  /\^\[=\+\\-@\]/
)
assert.match(
  code,
  /e\.postData\.contents\.length > 4096/
)
assert.match(
  code,
  /Array\.isArray\s*\(\s*payload\s*\)/
)
assert.match(
  code,
  /const handlers = \{/
)
assert.match(
  code,
  /getSheetByName\s*\(\s*SHEET_NAME\s*\)/
)
assert.match(
  code,
  /Sheet Pendaftaran tidak ditemukan/
)
assert.match(
  code,
  /Utilities[\s\S]*\.getUuid\s*\(\s*\)/
)
assert.match(
  code,
  /\.slice\s*\(\s*0\s*,\s*16\s*\)/
)

for (const name of [
  "diagnoseAdminKey",
  "resetSpreadsheetFresh",
  "setupDataSheet_",
  "setupSummarySheet_",
  "applyGovernmentSpreadsheetStyle",
  "styleGovernmentData_",
  "styleGovernmentSummary_",
  "generateUniqueCode_",
  "findRowBySuffix_",
  "suffixOf_",
  "pad_"
]) {
  assert.doesNotMatch(
    code,
    new RegExp(
      "function\\s+"
      + name
      + "\\s*\\("
    )
  )
}

assert.doesNotMatch(
  code,
  /KODE_ALPHABET/
)
assert.strictEqual(
  (
    code.match(
      /function\s+listRule_\s*\(/g
    )
    || []
  ).length,
  1
)
assert.doesNotMatch(
  code,
  /^\s*\/\//m
)
assert.doesNotMatch(
  code,
  /\/\*/
)

assert.match(
  walkin,
  /function\s+openWalkin\s*\(\s*\)/
)
assert.doesNotMatch(
  walkin,
  /if\s*\(\s*!getKey\s*\(\s*\)\s*\)/
)
assert.doesNotMatch(
  walkin,
  /openModal\s*\(\s*"modal-key"\s*\)/
)

assert.match(
  index,
  /assets\/logo-kepala-desa\.jpeg/
)
assert.doesNotMatch(
  index,
  /assets\/logo-kepala-desa\.jpg/
)
assert.match(
  publicScript,
  /sessionStorage/
)
assert.doesNotMatch(
  publicScript,
  /localStorage/
)

for (const file of fs.readdirSync("scripts")) {
  if (file.endsWith(".js")) {
    new vm.Script(
      fs.readFileSync(
        "scripts/" + file,
        "utf8"
      )
    )
  }
}

const phone = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
const tracking = /^JTM-[0-9]{8}-[A-Z0-9]{16}$/

assert(phone.test("081234567890"))
assert(phone.test("6281234567890"))
assert(!phone.test("071234567890"))
assert(
  tracking.test(
    "JTM-20261108-1234567890ABCDEF"
  )
)
assert(
  !tracking.test(
    "JTM-20261108-1234"
  )
)

console.log(
  "Security and regression tests passed"
)
