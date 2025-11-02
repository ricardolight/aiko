/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aiko_program.json`.
 */
export type AikoProgram = {
  "address": "C5tZmnn4FsM3urZEnc1sjPrWrEoPsqcScowBwrHnJLYv",
  "metadata": {
    "name": "aikoProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "AIKO AI Companion on CARV SVM"
  },
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "Initialize a new AIKO companion"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "aiko",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  105,
                  107,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "interact",
      "docs": [
        "Record an interaction with AIKO"
      ],
      "discriminator": [
        86,
        195,
        210,
        119,
        90,
        185,
        132,
        31
      ],
      "accounts": [
        {
          "name": "aiko",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  105,
                  107,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "owner",
          "relations": [
            "aiko"
          ]
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "aiko",
      "discriminator": [
        241,
        228,
        141,
        222,
        47,
        36,
        169,
        19
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "You are not authorized to interact with this AIKO"
    }
  ],
  "types": [
    {
      "name": "aiko",
      "docs": [
        "Account structure for AIKO"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "level",
            "type": "u8"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "totalInteractions",
            "type": "u64"
          },
          {
            "name": "lastInteraction",
            "type": "i64"
          },
          {
            "name": "streak",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
