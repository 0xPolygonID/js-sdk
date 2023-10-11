"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIDDocumentJSONSchema = void 0;
/** DIDDocumentJSONSchema is a basic schema of did document */
exports.DIDDocumentJSONSchema = `{
  "type": "object",
  "$defs": {
    "serviceEndpoint": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "serviceEndpoint": {
          "type": "string"
        },
        "metadata": {
          "type": "object"
        }
      },
      "required": [
        "id",
        "type",
        "serviceEndpoint"
      ]
    },
    "jsonWebKey": {
      "type": "object",
      "properties": {
        "alg": {
          "type": "string"
        },
        "crv": {
          "type": "string"
        },
        "e": {
          "type": "string"
        },
        "ext": {
          "type": "boolean"
        },
        "key_ops": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "kid": {
          "type": "string"
        },
        "kty": {
          "type": "string"
        },
        "n": {
          "type": "string"
        },
        "use": {
          "type": "string"
        },
        "x": {
          "type": "string"
        },
        "y": {
          "type": "string"
        }
      },
      "required": [
        "kty"
      ],
      "description": "Public parts of JSON web key"
    },
    "verificationMethod": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "controller": {
          "type": "string"
        },
        "publicKeyBase58": {
          "type": "string"
        },
        "publicKeyBase64": {
          "type": "string"
        },
        "publicKeyJwk": {
          "$ref": "#/$defs/jsonWebKey"
        },
        "publicKeyHex": {
          "type": "string"
        },
        "publicKeyMultibase": {
          "type": "string"
        },
        "blockchainAccountId": {
          "type": "string"
        },
        "ethereumAddress": {
          "type": "string"
        }
      },
      "required": [
        "id",
        "type",
        "controller"
      ]
    }
  },
  "properties": {
    "authentication": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "assertionMethod": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "keyAgreement": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "capabilityInvocation": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "capabilityDelegation": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "@context": {
      "anyOf": [
        {
          "type": "string",
          "const": "https://www.w3.org/ns/did/v1"
        },
        {
          "type": "string"
        },
        {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      ]
    },
    "id": {
      "type": "string"
    },
    "alsoKnownAs": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "controller": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      ]
    },
    "verificationMethod": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/verificationMethod"
      }
    },
    "service": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/serviceEndpoint"
      }
    },
    "publicKey": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/verificationMethod"
      },
      "deprecated": true
    }
  },
  "required": [
    "id"
  ]
}`;
//# sourceMappingURL=schema.js.map