
type OpenBrace = "{";
type CloseBrace = "}";
type Separator = ",";
type Expansion = "*";
type ParameterType = "?" | "&" | "#" | "." | ";" | "/" | "+";
type IllegalNameChar = Exclude<
  OpenBrace | CloseBrace | Separator | Expansion | ParameterType,
  "."
>;

/**
 * Removes any `ParameterType` from the front of a string and
 * any `Expansion` from the end.
 */
type RemoveModifiers<T extends string> =
  T extends `${ParameterType}${infer WithoutType}`
    ? WithoutType extends `${infer WithoutExpansion}${Expansion}`
      ? WithoutExpansion
      : WithoutType
    : T;

/**
 * Matches legal parameter names with optional modifiers.
 */
type ParameterName<T extends string> =
  RemoveModifiers<T> extends `${string}${IllegalNameChar}${string}`
    ? never
    : RemoveModifiers<T>;

/**
 * Matches a list of comma separated parameters.
 *
 * e.g. "?one,two*"  => "one" | "two"
 */
type ParameterList<T extends string> =
  T extends `${infer P}${Separator}${infer Rest}`
    ? ParameterName<P> extends infer Name extends string
      ? Name | ParameterList<Rest>
      : never
    : ParameterName<T> extends infer Name extends string
    ? Name
    : never;

/**
 * Matches all parameter groups
 *
 * e.g. "/path/{one}/path/{?two*,three}" => "one" | "two" | "three"
 */
type TemplateParameters<
  T extends string,
  Params extends string = never
> = T extends `${string}${OpenBrace}${infer List}${CloseBrace}${infer Rest}`
  ? TemplateParameters<Rest, ParameterList<List> | Params>
  : Params;

type PrimitiveValue = string | number | boolean | null;

type ExpandValue = PrimitiveValue | PrimitiveValue[] | object;
type Expand<T extends string> = [T] extends [never]
  ? never
  : { [K in T]?: ExpandValue };

type Template<
  T extends string,
  Params extends string = TemplateParameters<T>
> = [Params] extends [never]
  ? { expand(): string }
  : { expand(parameters: Expand<Params>): string };

function parseTemplate<T extends string>(
  input: T
): Template<T> {
  return {} as Template<T>;
}

parseTemplate("/abc/");
parseTemplate("/abc/{param}{?abc,def}{&ghi}").expand({ abc:123, param: "123" });
parseTemplate("/abc/{right}").expand({ wrong: "123" });


