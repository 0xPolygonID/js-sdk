// test files from https://github.com/iden3/go-schema-processor/pull/70
export const schema07 = `{
    "$metadata": {
      "uris": {
        "jsonLdContext": "ipfs://QmeMevwUeD7o6hjfmdaeFD1q4L84hSDiRjeXZLi1bZK1My"
      }
    },
    "$schema": "http://json-schema.org/draft-07/schema#",
    "description": "testNewType",
    "title": "testNewType",
    "properties": {
      "@context": {
        "type": [
          "string",
          "array",
          "object"
        ]
      },
      "expirationDate": {
        "format": "date-time",
        "type": "string"
      },
      "id": {
        "type": "string"
      },
      "issuanceDate": {
        "format": "date-time",
        "type": "string"
      },
      "issuer": {
        "type": [
          "string",
          "object"
        ],
        "format": "uri",
        "properties": {
          "id": {
            "format": "uri",
            "type": "string"
          }
        },
        "required": [
          "id"
        ]
      },
      "type": {
        "type": [
          "string",
          "array"
        ],
        "items": {
          "type": "string"
        }
      },
      "credentialSchema": {
        "properties": {
          "id": {
            "format": "uri",
            "type": "string"
          },
          "type": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "type"
        ],
        "type": "object"
      },
      "credentialSubject": {
        "description": "This required attribute stores the data of the credential",
        "title": "Credential subject",
        "properties": {
          "testNewTypeInt": {
            "description": "testNewTypeInt",
            "title": "testNewTypeInt",
            "type": "integer"
          },
          "id": {
            "description": "This required attribute stores the DID of the subject that owns the credential",
            "title": "Credential subject ID",
            "format": "uri",
            "type": "string"
          }
        },
        "required": [
          "id"
        ],
        "type": "object"
      }
    },
    "required": [
      "@context",
      "id",
      "issuanceDate",
      "issuer",
      "type",
      "credentialSchema",
      "credentialSubject"
    ],
    "type": "object"
  }`;

export const schema2020 = `{
      "$metadata": {
          "uris": {
              "jsonLdContext": "https://example.com/path/to/file/context.jsonld"
          }
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "A schema to test the advanced properties of the attributes",
      "title": "Test advanced properties",
      "properties": {
          "@context": {
              "type": [
                  "string",
                  "array",
                  "object"
              ]
          },
          "expirationDate": {
              "format": "date-time",
              "type": "string"
          },
          "id": {
              "type": "string"
          },
          "issuanceDate": {
              "format": "date-time",
              "type": "string"
          },
          "issuer": {
              "type": [
                  "string",
                  "object"
              ],
              "format": "uri",
              "properties": {
                  "id": {
                      "format": "uri",
                      "type": "string"
                  }
              },
              "required": [
                  "id"
              ]
          },
          "type": {
              "type": [
                  "string",
                  "array"
              ],
              "items": {
                  "type": "string"
              }
          },
          "credentialSchema": {
              "properties": {
                  "id": {
                      "format": "uri",
                      "type": "string"
                  },
                  "type": {
                      "type": "string"
                  }
              },
              "required": [
                  "id",
                  "type"
              ],
              "type": "object"
          },
          "credentialSubject": {
              "description": "This required attribute stores the data of the credential",
              "title": "Credential subject",
              "properties": {
                  "boolean": {
                      "$comment": "An internal comment for the attribute",
                      "default": [
                          false
                      ],
                      "description": "A description for the attribute",
                      "enum": [
                          true,
                          false
                      ],
                      "examples": [
                          true,
                          false
                      ],
                      "title": "Boolean",
                      "type": "boolean"
                  },
                  "string": {
                      "$comment": "An internal comment for the attribute",
                      "export const": "blue",
                      "default": "a default value",
                      "description": "A description for the attribute",
                      "enum": [
                          "blue",
                          "red",
                          "green"
                      ],
                      "examples": [
                          "blue",
                          "red",
                          "green"
                      ],
                      "title": "String",
                      "format": "regex",
                      "maxLength": 100,
                      "minLength": 1,
                      "type": "string"
                  },
                  "number": {
                      "$comment": "A comment on the number attribute",
                      "default": 4,
                      "description": "A description for the attribute",
                      "enum": [
                          1.1,
                          1.2,
                          1.3
                      ],
                      "examples": [
                          4.1,
                          8.1,
                          16.3
                      ],
                      "title": "Number",
                      "exclusiveMaximum": 16,
                      "exclusiveMinimum": 1,
                      "maximum": 16,
                      "minimum": 0,
                      "type": "number"
                  },
                  "integer": {
                      "$comment": "A comment on the integer attribute",
                      "default": 4,
                      "description": "A description for the attribute",
                      "enum": [
                          1,
                          4,
                          8,
                          16
                      ],
                      "examples": [
                          4,
                          8,
                          16
                      ],
                      "title": "Integer",
                      "exclusiveMaximum": 16,
                      "exclusiveMinimum": 0,
                      "maximum": 16,
                      "minimum": 1,
                      "multipleOf": 1,
                      "type": "integer"
                  },
                  "id": {
                      "description": "This required attribute stores the DID of the subject that owns the credential",
                      "title": "Credential subject ID",
                      "format": "uri",
                      "type": "string"
                  }
              },
              "required": [
                  "boolean",
                  "string",
                  "number",
                  "integer",
                  "id"
              ],
              "type": "object"
          }
      },
      "required": [
          "@context",
          "id",
          "issuanceDate",
          "issuer",
          "type",
          "credentialSchema",
          "credentialSubject"
      ],
      "type": "object"
  }`;

export const cred07 = `{"id":"https://dev.polygonid.me/api/v1/identities/did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy/claims/eca334b0-0e7d-11ee-889c-0242ac1d0006","@context":["https://www.w3.org/2018/credentials/v1","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld","ipfs://QmeMevwUeD7o6hjfmdaeFD1q4L84hSDiRjeXZLi1bZK1My"],"type":["VerifiableCredential","testNewType"],"expirationDate":"2030-01-01T00:00:00Z","issuanceDate":"2023-06-19T08:47:29.888363862Z","credentialSubject":{"id":"did:polygonid:polygon:mumbai:2qFTXJyiehHC19zLffRc9DYT88LQRViufWJzFSHCqL","testNewTypeInt":1,"type":"testNewType"},"credentialStatus":{"id":"https://dev.polygonid.me/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy/claims/revocation/status/162771772","revocationNonce":162771772,"type":"SparseMerkleTreeProof"},"issuer":"did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy","credentialSchema":{"id":"ipfs://QmQVeb5dkz5ekDqBrYVVxBFQZoCbzamnmMUn9B8twCEgDL","type":"JsonSchemaValidator2018"},"proof":[{"type":"BJJSignature2021","issuerData":{"id":"did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy","state":{"txId":"0xde8c8e234e9e4c159b9ce6361234c15eaaa123bddf15f395489a75e634e11182","blockTimestamp":1683792462,"blockNumber":35452981,"rootOfRoots":"03beaa14074a91698084d2dc077067babb8334584a7d73a047e6b238341b581d","claimsTreeRoot":"a5faef8b1fc67f65c55ad667919e51abfed008ca97475c41b26a5e70fd4c4a0a","revocationTreeRoot":"0000000000000000000000000000000000000000000000000000000000000000","value":"5ab768f8f2ec3f94e6830908fbf428ca3386ff87a5e704fcd1f11cae3420611f"},"authCoreClaim":"cca3371a6cb1b715004407e325bd993c080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e3b9e422feb1dcf83882b33bddf3c9a64d300e2280e9c286bb75839c824ace27c5560b8ca92be27698a14f6970c32731e73768d74fe83d0fd4f16f14b4402d242dd87d9900000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","mtp":{"existence":true,"siblings":["16600125203338042323361216512603158366636445287571403125891881295088432028008","11315256355804790111057838658876672619892914293003422319088357823149445991751","5953630948937947438067785504646477838099205855387889079750411149043045455341","7144700925452824210038939338852356191428773494854012082867969138805603048585","3921545027306074721354497759643961758048633515411954472382458013486548057049","0","0","5436254548464410857916946211162171910597645182542037135954554779197265908702"]},"credentialStatus":{"id":"https://dev.polygonid.me/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy/claims/revocation/status/2575161389","revocationNonce":2575161389,"type":"SparseMerkleTreeProof"}},"coreClaim":"d7939e871529d085f1c549ab8e3484642a000000000000000000000000000000021241e014bc0bed916380369c66daf6a49a2efaafe19b9eead97ecd45fb0f007a4a3b209875d293677af876eb5a00b97739bcff3aef28d677654a4216fe142100000000000000000000000000000000000000000000000000000000000000003cb3b3090000000080d8db700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","signature":"b25559a5b4f56e4279f318440e3f57173046abf46970a34725cc293146cd07af5a1554462d8254f11bea18c0e32969b8e5bb740a74e0f79cf81639c2249b4103"},{"type":"Iden3SparseMerkleTreeProof","issuerData":{"id":"did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy","state":{"txId":"0xd7acd97658a9fd46fcecc297a2658e87484c4fb158b5cc751fa55cc66a528901","blockTimestamp":1687164493,"blockNumber":37031106,"rootOfRoots":"013157d23e45439d797cf21eff7cce75a62c571eeebbd4bb3fc0f82b938e2725","claimsTreeRoot":"db2b0678c8d26177a6c7b316cac669f1d37baf6e69a9a8f45dd2b0127008a50c","revocationTreeRoot":"2f81358078a2ea3874ce6000994fc57d399b57d2d2239fc0d40e7112409af804","value":"4d997e8bf918046a338da7d3a60fc1a66b9b549718b8391071ca2eef8951492a"}},"coreClaim":"d7939e871529d085f1c549ab8e3484642a000000000000000000000000000000021241e014bc0bed916380369c66daf6a49a2efaafe19b9eead97ecd45fb0f007a4a3b209875d293677af876eb5a00b97739bcff3aef28d677654a4216fe142100000000000000000000000000000000000000000000000000000000000000003cb3b3090000000080d8db700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","mtp":{"existence":true,"siblings":["7014863375885756478216431089540562731662914991320699716584671851123060599668","21315600889769805398676045356078521059928852692746112705474647520974404948890","21548560938430009683383944561421125979714483097439757511725983865213908705359","20098927269510769492310533561375018705245216008792620555365069905774375917381","7203728335210032481762971413039087279239292151184438299705033616348328560570","0","0","0","0","6742687216537986078187329258797021007707864223416791051080996892176890387669"]}}]}`;

export const cred20 = `{"id":"https://dev.polygonid.me/api/v1/identities/did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy/claims/eca334b0-0e7d-11ee-889c-0242ac1d0006","@context":["https://www.w3.org/2018/credentials/v1","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld","ipfs://QmeMevwUeD7o6hjfmdaeFD1q4L84hSDiRjeXZLi1bZK1My"],"type":["VerifiableCredential","testNewType"],"expirationDate":"2030-01-01T00:00:00Z","issuanceDate":"2023-06-19T08:47:29.888363862Z","credentialSubject":{"id":"did:polygonid:polygon:mumbai:2qFTXJyiehHC19zLffRc9DYT88LQRViufWJzFSHCqL","testNewTypeInt":1,"type":"testNewType","integer":1,"number":1.2,"string":"blue","boolean":true},"credentialStatus":{"id":"https://dev.polygonid.me/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy/claims/revocation/status/162771772","revocationNonce":162771772,"type":"SparseMerkleTreeProof"},"issuer":"did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy","credentialSchema":{"id":"ipfs://QmQVeb5dkz5ekDqBrYVVxBFQZoCbzamnmMUn9B8twCEgDL","type":"JsonSchema2023"},"proof":[{"type":"BJJSignature2021","issuerData":{"id":"did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy","state":{"txId":"0xde8c8e234e9e4c159b9ce6361234c15eaaa123bddf15f395489a75e634e11182","blockTimestamp":1683792462,"blockNumber":35452981,"rootOfRoots":"03beaa14074a91698084d2dc077067babb8334584a7d73a047e6b238341b581d","claimsTreeRoot":"a5faef8b1fc67f65c55ad667919e51abfed008ca97475c41b26a5e70fd4c4a0a","revocationTreeRoot":"0000000000000000000000000000000000000000000000000000000000000000","value":"5ab768f8f2ec3f94e6830908fbf428ca3386ff87a5e704fcd1f11cae3420611f"},"authCoreClaim":"cca3371a6cb1b715004407e325bd993c080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e3b9e422feb1dcf83882b33bddf3c9a64d300e2280e9c286bb75839c824ace27c5560b8ca92be27698a14f6970c32731e73768d74fe83d0fd4f16f14b4402d242dd87d9900000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","mtp":{"existence":true,"siblings":["16600125203338042323361216512603158366636445287571403125891881295088432028008","11315256355804790111057838658876672619892914293003422319088357823149445991751","5953630948937947438067785504646477838099205855387889079750411149043045455341","7144700925452824210038939338852356191428773494854012082867969138805603048585","3921545027306074721354497759643961758048633515411954472382458013486548057049","0","0","5436254548464410857916946211162171910597645182542037135954554779197265908702"]},"credentialStatus":{"id":"https://dev.polygonid.me/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy/claims/revocation/status/2575161389","revocationNonce":2575161389,"type":"SparseMerkleTreeProof"}},"coreClaim":"d7939e871529d085f1c549ab8e3484642a000000000000000000000000000000021241e014bc0bed916380369c66daf6a49a2efaafe19b9eead97ecd45fb0f007a4a3b209875d293677af876eb5a00b97739bcff3aef28d677654a4216fe142100000000000000000000000000000000000000000000000000000000000000003cb3b3090000000080d8db700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","signature":"b25559a5b4f56e4279f318440e3f57173046abf46970a34725cc293146cd07af5a1554462d8254f11bea18c0e32969b8e5bb740a74e0f79cf81639c2249b4103"},{"type":"Iden3SparseMerkleTreeProof","issuerData":{"id":"did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy","state":{"txId":"0xd7acd97658a9fd46fcecc297a2658e87484c4fb158b5cc751fa55cc66a528901","blockTimestamp":1687164493,"blockNumber":37031106,"rootOfRoots":"013157d23e45439d797cf21eff7cce75a62c571eeebbd4bb3fc0f82b938e2725","claimsTreeRoot":"db2b0678c8d26177a6c7b316cac669f1d37baf6e69a9a8f45dd2b0127008a50c","revocationTreeRoot":"2f81358078a2ea3874ce6000994fc57d399b57d2d2239fc0d40e7112409af804","value":"4d997e8bf918046a338da7d3a60fc1a66b9b549718b8391071ca2eef8951492a"}},"coreClaim":"d7939e871529d085f1c549ab8e3484642a000000000000000000000000000000021241e014bc0bed916380369c66daf6a49a2efaafe19b9eead97ecd45fb0f007a4a3b209875d293677af876eb5a00b97739bcff3aef28d677654a4216fe142100000000000000000000000000000000000000000000000000000000000000003cb3b3090000000080d8db700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","mtp":{"existence":true,"siblings":["7014863375885756478216431089540562731662914991320699716584671851123060599668","21315600889769805398676045356078521059928852692746112705474647520974404948890","21548560938430009683383944561421125979714483097439757511725983865213908705359","20098927269510769492310533561375018705245216008792620555365069905774375917381","7203728335210032481762971413039087279239292151184438299705033616348328560570","0","0","0","0","6742687216537986078187329258797021007707864223416791051080996892176890387669"]}}]}`;
