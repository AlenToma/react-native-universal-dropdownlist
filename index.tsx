import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  ScrollView
} from 'react-native';
const DropDownContext = React.createContext(
  {} as {
    show: (item: React.ReactNode, id: string) => void;
    clear: () => void;
    component: { id: string; event: (v: boolean) => void }[];
    registerComponent: (id: string, value: (v: boolean) => void) => void;
    unregisterComponent: (id: string) => void;
  }
);
export const DropDownProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentValue, setCurrentValue] = useState(
    undefined as React.ReactNode | undefined
  );

  const [appcontextValue] = useState({
    show: (value: React.ReactNode, id: string) => {
      appcontextValue.component.forEach((x) => {
        if (x.id != id) {
          x.event(false);
        }
      });
      setCurrentValue(
        <>
          <TouchableOpacity
            activeOpacity={0.1}
            style={{
              zIndex: 188,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            onPress={() => appcontextValue.clear()}
          />
          {value}
        </>
      );
    },
    clear: () => {
      setCurrentValue(undefined);
      appcontextValue.component.forEach((x) => x.event(false));
    },
    component: [] as { id: string; event: (v: boolean) => void }[],
    registerComponent: (id: string, component: (v: boolean) => void) => {
      appcontextValue.component.push({ id: id, event: component });
    },
    unregisterComponent: (id: string) => {
      appcontextValue.component = appcontextValue.component.slice(
        appcontextValue.component.findIndex((x) => x.id == id),
        1
      );
    },
  });

  return (
    <DropDownContext.Provider value={appcontextValue}>
      {children}
      {currentValue ? currentValue : null}
    </DropDownContext.Provider>
  );
};

export interface DropDownItem {
  label: string;
  value: any;
  icon: () => React.ReactNode;
}

export const DropDownList = ({
  items,
  selectedValue,
  placeHolder,
  onSelect,
  style,
  dropDownListStyle,
  dropDownItemStyle,
  dropDownListTextStyle,
  dropDownListSelectedTextStyle,
  includeIconOnTextInput,
}: {
  items: DropDownItem[];
  selectedValue: any;
  placeHolder?: string;
  onSelect?: (selectedItem: DropDownItem) => void;
  style?: StyleProp<ViewStyle>;
  dropDownListStyle?: StyleProp<ViewStyle>;
  dropDownItemStyle?: StyleProp<ViewStyle>;
  dropDownListTextStyle?: StyleProp<ViewStyle>;
  dropDownListSelectedTextStyle?: StyleProp<ViewStyle>;
  includeIconOnTextInput?: boolean;
}) => {
  const dropDownContext = useContext(DropDownContext);
  const [visible, setVisible] = useState(false as Boolean);
  const [id] = useState(new Date().getUTCMilliseconds().toString());
  const refs = React.createRef<View>();
  const [position, setPosition] = useState(
    {} as { top: number; left: number; height: number; width: number }
  );

  const show = () => {
    dropDownContext.show(
      <View
        style={[
          dropDownListStyle,
          styles.list,
          {
            top: position.top + position.height,
            left: position.left,
            width: position.width,
          },
        ]}>
        <ScrollView>
          {items.map((x, index) => (
            <TouchableOpacity
              key={index}
              style={[
                dropDownItemStyle,
                styles.dropDownItem,
                {
                  width: '100%',
                  paddingLeft: 5,
                  backgroundColor:
                    x.value === selectedValue ? '#ff6358' : undefined,
                },
                dropDownListSelectedTextStyle,
              ]}
              onPress={() => {
                onSelect ? onSelect(x) : null;
                dropDownContext.clear();
              }}>
              {x.icon ? x.icon() : null}
              <Text
                style={[
                  dropDownListTextStyle,
                  {
                    width: '100%',
                    paddingLeft: 5,
                    backgroundColor:
                      x.value === selectedValue ? '#ff6358' : undefined,
                    color: x.value === selectedValue ? '#fff' : undefined,
                  },
                  dropDownListSelectedTextStyle,
                ]}>
                {x.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>,
      id
    );
  };

  useEffect(() => {
    dropDownContext.registerComponent(id, setVisible);
    if (refs.current) {
      refs.current.measure((fx, fy, width, height, px, py) => {
        setPosition({
          top: py,
          left: px,
          height: height,
          width: width,
        });
      });
    }

    return () => {
      dropDownContext.unregisterComponent(id);
    };
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        if (visible) dropDownContext.clear();
        else show();
        setVisible(!visible);
      }}>
      <View style={[styles.input, style]} ref={refs}>
        <Text>
          {selectedValue && items && items.length && includeIconOnTextInput
            ? items.find((x) => x.value == selectedValue)?.icon() ?? null
            : null}
          <Text style={{ paddingLeft: 5 }}>
            {selectedValue && items && items.length
              ? items.find((x) => x.value == selectedValue)?.label ??
                placeHolder
              : placeHolder}
          </Text>
        </Text>
        <Text
          style={[
            styles.arrow,
            {
              transform: [{ rotateX: !visible ? '180deg' : '0deg' }],
              marginTop: !visible ? -4 : 0,
            },
          ]}>
          ^
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    minWidth: 150,
    height: 30,
    borderColor: '#CCC',
    borderWidth: 0.5,
    padding: 5,
    zIndex: 200,
  },
  arrow: {
    fontSize: 15,
    position: 'absolute',
    right: 5,
    fontWeight: 'bold',
  },

  dropDownItem: {
    flexDirection: 'row',
    width: '100%',
    padding: 5,
  },

  list: {
    maxHeight: '50%',
    borderColor: '#CCC',
    borderWidth: 0.5,
    position: 'absolute',
    zIndex: 200,
    backgroundColor: 'white',
    borderTopWidth: 0,
  },
});
